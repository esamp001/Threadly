const express = require('express');
const db = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');
const { sendBugReportEmail } = require('../utils/emailService');

const router = express.Router();

/**
 * Validates if a value is a valid HTTP/HTTPS URL
 * This is used to validate optional screenshot and page URLs before processing
 * @param {string} value - Candidate URL string
 * @returns {boolean} - True when URL is valid and uses http/https protocol
 */
const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

// POST /api/reports/bug - Submit a bug report from authenticated user
router.post('/bug', checkAuth, async (req, res) => {
  const { message, screenshot_url, page_url } = req.body;

  let status = 200;
  let success = true;
  let error_message = '';
  let responseMessage = 'Report has been sent';

  try {
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      status = 400;
      success = false;
      error_message = 'Bug report message is required';
      throw new Error(error_message);
    }

    if (trimmedMessage.length > 2000) {
      status = 400;
      success = false;
      error_message = 'Bug report message is too long (max 2000 characters)';
      throw new Error(error_message);
    }

    if (screenshot_url && !isValidHttpUrl(screenshot_url)) {
      status = 400;
      success = false;
      error_message = 'Invalid screenshot URL format';
      throw new Error(error_message);
    }

    if (page_url && !isValidHttpUrl(page_url)) {
      status = 400;
      success = false;
      error_message = 'Invalid page URL format';
      throw new Error(error_message);
    }

    const reporter = await db('users')
      .select('id', 'username', 'email')
      .where('id', req.user.userId)
      .first();

    if (!reporter) {
      status = 404;
      success = false;
      error_message = 'Authenticated user not found';
      throw new Error(error_message);
    }

    await sendBugReportEmail({
      message: trimmedMessage,
      reporterEmail: reporter.email || 'unknown@space.local',
      reporterUsername: reporter.username || 'Unknown User',
      screenshotUrl: screenshot_url || null,
      pageUrl: page_url || null,
    });
  } catch (error) {
    if (!error_message) {
      status = 500;
      success = false;
      error_message = 'Failed to send bug report';
      responseMessage = '';
    }
  } finally {
    res.status(status).json({
      success,
      status,
      ...(success ? { message: responseMessage } : { error_message }),
    });
  }
});

module.exports = router;
