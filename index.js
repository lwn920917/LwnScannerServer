const cors = require('cors');
const axios = require('axios'); // 导入axios库
const express = require('express');
const app = express();
app.use(cors());
// 增加 body-parser 的限制
app.use(express.json({ limit: '50mb' }));
require('dotenv').config();


const PORT = 3334;

// Mathpix API 凭证
const APP_ID = process.env.MATHPIX_APP_ID;
const APP_KEY = process.env.MATHPIX_APP_KEY;

app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'Welcome to the Mathpix API Service!' });
});

app.post('/upload_image', async (req, res) => {
    //console.log(req.body);
    console.log("upload_image");
    try {
        const { base64 } = req.body;
        if (!base64) {
            return res.status(400).json({ status: 'error', message: 'Base64 data is required' });
        }

        // 构建请求体
        const requestBody = {
            src: `data:image/png;base64,${base64}`,
            formats: [
                'text',
                //'data',
                //'html',
                //'latex_styled'
            ],
            "data_options": {
                /*  "include_svg": true,
                 "include_table_html": true,
                 "include_latex": true,
                 "include_tsv": true,
                 "include_asciimath": true,
                 "include_mathml": true, */
            }
        };

        // 发送请求到Mathpix API
        const response = await axios.post('https://api.mathpix.com/v3/text', requestBody, {
            headers: {
                'app_id': APP_ID,
                'app_key': APP_KEY,
                'Content-Type': 'application/json'
            }
        });
        //console.log(response.data)
        // 处理Mathpix API响应
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

app.listen(PORT, () => {
    console.log(`Server is running on xxx:${PORT}`);
});