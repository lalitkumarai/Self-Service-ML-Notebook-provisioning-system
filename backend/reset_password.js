
const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');
const path = require('path');

// Try loading from local .env or parent directory
dotenv.config({ path: path.join(__dirname, '.env') });

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const email = 'lalit@example.com';
        let user = await User.findOne({ email });
        
        if (!user) {
            console.log(`User ${email} not found. Creating...`);
            user = await User.create({
                username: 'Lalit',
                email: email,
                passwordHash: 'password123',
                role: 'user'
            });
        } else {
            console.log(`User ${email} found. Resetting password...`);
            user.passwordHash = 'password123';
            await user.save();
        }
        
        console.log('Password reset successfully for:', email);
        console.log('New Password: password123');
        
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
