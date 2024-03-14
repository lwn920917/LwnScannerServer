const cors = require('cors');
const axios = require('axios');
const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
require('dotenv').config();

const PORT = 3334;

// SSL 证书路径
const privateKey = fs.readFileSync('/var/www/tslwn.com.cn.key', 'utf8');
const certificate = fs.readFileSync('/var/www/tslwn.com.cn.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Mathpix API 凭证
const APP_ID = process.env.MATHPIX_APP_ID;
const APP_KEY = process.env.MATHPIX_APP_KEY;

app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'Welcome to the Mathpix API Service!' });
});

app.post('/upload_image', async (req, res) => {
    console.log("upload_image");
    try {
        const { base64 } = req.body;
        if (!base64) {
            return res.status(400).json({ status: 'error', message: 'Base64 data is required' });
        }

        const requestBody = {
            src: `data:image/png;base64,${base64}`,
            formats: ['text'],
            "data_options": {
                // 这里可以根据需要开启更多的选项
            }
        };

        const response = await axios.post('https://api.mathpix.com/v3/text', requestBody, {
            headers: {
                'app_id': APP_ID,
                'app_key': APP_KEY,
                'Content-Type': 'application/json'
            }
        });

        const { text, data } = response.data;
        console.log(text);
        res.json({
            status: 'success',
            message: 'Image processed successfully',
            text: text,
            data: data,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to process image' });
    }
});

// 创建 HTTPS 服务器
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
    console.log(`Server is running on https://xxx:${PORT}`);
});
