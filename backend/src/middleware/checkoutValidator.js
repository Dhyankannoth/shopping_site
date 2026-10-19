/**
 * Delivery Details Validation Middleware
 * Traceable to: FR-CHK-002, FR-ERR-001
 */
export function validateDeliveryDetails(req, res, next) {
  const delivery = req.body?.deliveryDetails || {};
  const errors = [];

  const recipientName = typeof delivery.recipientName === 'string' ? delivery.recipientName.trim() : '';
  const address = typeof delivery.address === 'string' ? delivery.address.trim() : '';
  const city = typeof delivery.city === 'string' ? delivery.city.trim() : '';
  const postalCode = typeof delivery.postalCode === 'string' ? delivery.postalCode.trim() : '';

  if (!recipientName) {
    errors.push({ field: 'recipientName', message: 'Recipient name cannot be empty or whitespace' });
  } else if (recipientName.length < 2 || recipientName.length > 100) {
    errors.push({ field: 'recipientName', message: 'Recipient name must be between 2 and 100 characters' });
  }

  if (!address) {
    errors.push({ field: 'address', message: 'Street address cannot be empty or whitespace' });
  } else if (address.length < 5 || address.length > 255) {
    errors.push({ field: 'address', message: 'Address must be between 5 and 255 characters' });
  }

  if (!city) {
    errors.push({ field: 'city', message: 'City cannot be empty or whitespace' });
  } else if (city.length < 2 || city.length > 100) {
    errors.push({ field: 'city', message: 'City must be between 2 and 100 characters' });
  }

  if (!postalCode) {
    errors.push({ field: 'postalCode', message: 'Postal code cannot be empty or whitespace' });
  } else if (postalCode.length < 3 || postalCode.length > 20) {
    errors.push({ field: 'postalCode', message: 'Postal code must be between 3 and 20 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid demonstration delivery details',
        details: errors,
      },
    });
  }

  req.body.deliveryDetails = {
    recipientName,
    address,
    city,
    postalCode,
  };

  next();
}
