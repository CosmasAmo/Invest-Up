import transporter from '../config/nodemailer.js';

console.log('Testing nodemailer export...');
console.log('==========================');

console.log('Transporter type:', typeof transporter);
console.log('Transporter has sendMail method:', typeof transporter.sendMail === 'function');
console.log('Transporter has verify method:', typeof transporter.verify === 'function');

if (transporter && typeof transporter.sendMail === 'function') {
    console.log('✅ Transporter export is working correctly!');
    
    // Test the verify method
    try {
        await transporter.verify();
        console.log('✅ Transporter verification successful!');
    } catch (error) {
        console.log('⚠️ Transporter verification failed (this might be expected in preview mode):', error.message);
    }
} else {
    console.log('❌ Transporter export is not working correctly!');
}

console.log('Export test completed.'); 