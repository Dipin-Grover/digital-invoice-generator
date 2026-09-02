const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceStats, setInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/stats').get(protect, getInvoiceStats);
router.route('/').get(protect, getInvoices).post(protect, setInvoice);
router.route('/:id').put(protect, updateInvoice).delete(protect, deleteInvoice);

module.exports = router;
