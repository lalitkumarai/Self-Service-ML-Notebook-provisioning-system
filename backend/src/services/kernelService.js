const { spawn, exec } = require('child_process');
const os = require('os');

const EXECUTION_TIMEOUT_MS = 60000; // 60 seconds
const MAX_MEMORY_MB = 512;
const MEMORY_CHECK_INTERVAL_MS = 1000; // Check every second

class KernelService {
    constructor() {
        this.sessions = new Map(); // socketId -> { process, buffer, timeoutId, intervalId }
    }

    startSession(socketId, io) {
        if (this.sessions.has(socketId)) {
            return;
        }

        // TODO: In production, this should connect to the user's Kubernetes Pod
        // Example: const stream = k8sExec.exec(namespace, podName, containerName, ['python', '-u', '-i'], ...);
        // For now, we spawn a local Python process to simulate the kernel.
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        const process = spawn(pythonCmd, ['-u', '-i']); // -u for unbuffered, -i for interactive

        console.log(`[Kernel] Started Python session for ${socketId}`);

        const session = {
            process,
            currentCellId: null,
            io,
            timeoutId: null,
            intervalId: null
        };

        this.sessions.set(socketId, session);

        // Handle stdout
        process.stdout.on('data', (data) => {
            let output = data.toString();
            const sentinel = '__KERNEL_EXEC_DONE__';
            const imgStart = '__IMG_START__';
            const imgEnd = '__IMG_END__';
            
            // Check for image markers
            if (output.includes(imgStart) && output.includes(imgEnd)) {
                const parts = output.split(imgStart);
                const preImage = parts[0];
                const afterStart = parts[1].split(imgEnd);
                const base64Img = afterStart[0];
                const postImage = afterStart[1];

                // Emit pre-image stdout
                if (preImage && preImage.trim() !== '>>>' && preImage.trim() !== '...') {
                    // Remove prompts if they are at the end of preImage (unlikely but possible)
                    let cleanPre = preImage.replace(/>>>\s*$/, '').replace(/\.\.\.\s*$/, '');
                    if (cleanPre) {
                        io.to(socketId).emit('output', { 
                            type: 'stdout', 
                            data: cleanPre,
                            cellId: session.currentCellId
                        });
                    }
                }
                
                // Emit image
                if (base64Img) {
                    io.to(socketId).emit('output', { 
                        type: 'image', 
                        content: base64Img,
                        cellId: session.currentCellId
                    });
                }
                
                // Update output to be only the post-image part for further processing
                output = postImage || '';
            }

            if (output.includes(sentinel)) {
                // Execution finished successfully
                this.clearSafetyChecks(session);

                // Split output by sentinel
                const parts = output.split(sentinel);
                // Emit the part before sentinel
                if (parts[0] && parts[0].trim() !== '>>>' && parts[0].trim() !== '...') {
                     // Clean up prompt artifacts if they appear at the end of the real output
                     let cleanOutput = parts[0].replace(/>>>\s*$/, '').replace(/\.\.\.\s*$/, '');
                     if (cleanOutput) {
                        io.to(socketId).emit('output', { 
                            type: 'stdout', 
                            data: cleanOutput,
                            cellId: session.currentCellId
                        });
                     }
                }
                
                // Emit completion event
                io.to(socketId).emit('execution_status', { 
                    status: 'completed', 
                    cellId: session.currentCellId 
                });
                session.currentCellId = null;
            } else {
                // Normal output
                if (output && output.trim() !== '>>>' && output.trim() !== '...') {
                    io.to(socketId).emit('output', { 
                        type: 'stdout', 
                        data: output,
                        cellId: session.currentCellId
                    });
                }
            }
        });

        // Handle stderr
        process.stderr.on('data', (data) => {
             const error = data.toString();
             // Python interactive mode often prints prompt to stderr
             if (error.trim() !== '>>>' && error.trim() !== '...') {
                io.to(socketId).emit('output', { 
                    type: 'stderr', 
                    data: error,
                    cellId: session.currentCellId
                });
             }
        });

        return process;
    }

    executeCode(socketId, code, cellId) {
        const session = this.sessions.get(socketId);
        if (!session) {
            // If session is missing (e.g. restart), try to recover or error
            // Here we error, but we could pass 'io' to recover if we refactor startSession
            // For now, assume session exists or fail
            return; 
        }

        const { process: pyProcess } = session;
        session.currentCellId = cellId;

        // Clear previous checks just in case
        this.clearSafetyChecks(session);

        // Notify running
        session.io.to(socketId).emit('execution_status', { status: 'running', cellId });

        // 1. Setup Timeout
        session.timeoutId = setTimeout(() => {
            this.handleTimeout(socketId, session);
        }, EXECUTION_TIMEOUT_MS);

        // 2. Setup Memory Check
        session.intervalId = setInterval(() => {
            this.checkMemoryUsage(socketId, session);
        }, MEMORY_CHECK_INTERVAL_MS);

        try {
            // Write code to stdin
            // We append a newline to ensure execution
            // And append the sentinel printer
            const sentinelCode = `\nprint('__KERNEL_EXEC_DONE__')\n`;
            
            pyProcess.stdin.write(code + '\n');
            // We might need an extra newline to trigger execution for block code
            pyProcess.stdin.write('\n');
            pyProcess.stdin.write(sentinelCode);
        } catch (error) {
            console.error('Failed to write to python process:', error);
            this.clearSafetyChecks(session);
            session.io.to(socketId).emit('error', 'Kernel execution failed');
            session.io.to(socketId).emit('execution_status', { status: 'failed', cellId });
        }
    }

    clearSafetyChecks(session) {
        if (session.timeoutId) {
            clearTimeout(session.timeoutId);
            session.timeoutId = null;
        }
        if (session.intervalId) {
            clearInterval(session.intervalId);
            session.intervalId = null;
        }
    }

    handleTimeout(socketId, session) {
        console.log(`[Kernel] Execution timed out for ${socketId}`);
        this.clearSafetyChecks(session);
        
        session.io.to(socketId).emit('output', { 
            type: 'stderr', 
            data: `\nError: Execution timed out after ${EXECUTION_TIMEOUT_MS/1000} seconds. Kernel restarting...\n`,
            cellId: session.currentCellId
        });
        
        session.io.to(socketId).emit('execution_status', { 
            status: 'failed', 
            cellId: session.currentCellId 
        });

        this.restartSession(socketId);
    }

    checkMemoryUsage(socketId, session) {
        if (!session.process || !session.process.pid) return;

        const pid = session.process.pid;
        const cmd = os.platform() === 'win32' 
            ? `tasklist /FI "PID eq ${pid}" /FO CSV /NH`
            : `ps -o rss= -p ${pid}`;

        exec(cmd, (error, stdout) => {
            if (error) return;

            let memoryUsageMB = 0;
            if (os.platform() === 'win32') {
                // "python.exe","1234","Console","1","12,345 K"
                const match = stdout.match(/"([^"]+ K)"/);
                if (match && match[1]) {
                    const memStr = match[1].replace(/,/g, '').replace(' K', '');
                    memoryUsageMB = parseInt(memStr, 10) / 1024;
                }
            } else {
                // KB
                memoryUsageMB = parseInt(stdout.trim(), 10) / 1024;
            }

            if (memoryUsageMB > MAX_MEMORY_MB) {
                console.log(`[Kernel] Memory limit exceeded for ${socketId}: ${memoryUsageMB.toFixed(2)}MB`);
                this.clearSafetyChecks(session);
                
                session.io.to(socketId).emit('output', { 
                    type: 'stderr', 
                    data: `\nError: Memory limit exceeded (${memoryUsageMB.toFixed(2)}MB > ${MAX_MEMORY_MB}MB). Kernel restarting...\n`,
                    cellId: session.currentCellId
                });

                session.io.to(socketId).emit('execution_status', { 
                    status: 'failed', 
                    cellId: session.currentCellId 
                });

                this.restartSession(socketId);
            }
        });
    }

    restartSession(socketId) {
        console.log(`[Kernel] Restarting session for ${socketId}`);
        const session = this.sessions.get(socketId);
        const io = session ? session.io : null;
        
        this.stopSession(socketId);
        
        if (io) {
            this.startSession(socketId, io);
            io.to(socketId).emit('kernel_restarted', { message: 'Kernel has been restarted.' });
        }
    }

    stopSession(socketId) {
        const session = this.sessions.get(socketId);
        if (session) {
            this.clearSafetyChecks(session);
            session.process.kill();
            this.sessions.delete(socketId);
            console.log(`[Kernel] Stopped session for ${socketId}`);
        }
    }
}

module.exports = new KernelService();
