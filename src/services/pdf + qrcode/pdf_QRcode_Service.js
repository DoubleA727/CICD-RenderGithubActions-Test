// services/pdfService.js
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const path = require("path");
const QRCode = require('qrcode');

exports.generatePDF = async ({ orderId, email, items, total }) => {
    const filePath = path.join(__dirname, "./template.ejs");

    // Render HTML using EJS
    const html = await ejs.renderFile(filePath, {
        orderId,
        email,
        items,
        total
    });

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
};

exports.generateQRCODE = async ({ orderId, email, items, total }) => {
    const filePath = path.join(__dirname, "./template.ejs");

    // Render HTML using EJS
    const html = await ejs.renderFile(filePath, {
        orderId,
        email,
        items,
        total
    });

    // Create QR code
    // convert the HTML to Base64
    const base64HTML = Buffer.from(html).toString("base64");
    // this content will go inside the QR code
    const dataUrl = `data:text/html;base64,${base64HTML}`;
    // generate QR code
    const qrImage = await QRCode.toDataURL(dataUrl);

    return qrImage;
};