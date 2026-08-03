/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall } = require("firebase-functions/v2/https");

exports.processBookingPriority = onCall((request) => {
  const { counsellor, date, time, priority, reason } = request.data;

  // 服务器端逻辑处理与凭证生成
  const refCode = "REF-" + Math.floor(100000 + Math.random() * 900000);
  
  return {
    success: true,
    referenceCode: refCode,
    status: "Approved (Cloud Processed)",
    processedAt: new Date().toISOString()
  };
});
