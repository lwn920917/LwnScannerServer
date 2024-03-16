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
    res.json({ status: 'success', message: 'Welcome to the API L Service!' });
});

app.post('/upload_image', async (req, res) => {
    console.log("upload_image");
    try {
        const { base64 } = req.body;
        if (!base64) {
            return res.status(400).json({ status: 'error', message: 'Base64 data is required' });
        }

        // 1. 调用 v3/text API 获取图像的文本内容 text
        const response = await axios.post('https://api.mathpix.com/v3/text', {
            src: `data:image/png;base64,${base64}`,
            formats: ['text'],
            enable_tables_fallback: true
        }, {
            headers: {
                'app_id': APP_ID,
                'app_key': APP_KEY,
                'Content-Type': 'application/json'
            }
        });

        const { text } = response.data;
        console.log("text ok");

        // 2. 调用 v3/converter API 将 text 转换为 Markdown 格式
        const conversionResponse = await axios.post('https://api.mathpix.com/v3/converter', {
            mmd: text,
            formats: {
                md: true
            }
        }, {
            headers: {
                'app_id': APP_ID,
                'app_key': APP_KEY,
                'Content-Type': 'application/json'
            }
        });

        const { conversion_id } = conversionResponse.data;
        console.log("id " + conversion_id);

        // 3. 查询转换状态,直到完成或超时
        const startTime = Date.now();
        const timeoutLimit = 30000; // 30 秒超时
        let conversionStatus;
        do {
            const statusResponse = await axios.get(`https://api.mathpix.com/v3/converter/${conversion_id}`, {
                headers: {
                    'app_id': APP_ID,
                    'app_key': APP_KEY
                }
            });
            conversionStatus = statusResponse.data.status;
            console.log("state " + conversionStatus);
            if (Date.now() - startTime > timeoutLimit) {
                throw new Error('Conversion timed out');
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒
        } while (conversionStatus !== 'completed');

        // 4. 下载转换结果
        const downloadResponse = await axios.get(`https://api.mathpix.com/v3/converter/${conversion_id}.md`, {
            headers: {
                'app_id': APP_ID,
                'app_key': APP_KEY
            }
        });
        const markdown = downloadResponse.data;
        console.log("md ");

        // 5. 将结果返回给前端
        res.json({
            status: 'success',
            message: 'Image processed successfully',
            text: text,
            markdown: markdown
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Failed to process image' });
    }
});

// 创建 HTTPS 服务器
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
    console.log(`Server is running on https://xxx:${PORT}`);
});