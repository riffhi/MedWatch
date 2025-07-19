// WhatsApp messaging service using Twilio
class WhatsAppService {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  async sendWhatsAppMessage(to, message) {
    try {
      const response = await fetch(`${this.baseUrl}/api/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
          message: message
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send WhatsApp message');
      }

      return result;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  async sendShortageAlert(phoneNumber, medicineDetails) {
    const message = `🚨 MEDICINE SHORTAGE ALERT 🚨

Medicine: ${medicineDetails.name}
Location: ${medicineDetails.location}
Severity: ${medicineDetails.severity.toUpperCase()}

${medicineDetails.description}

Check the MedWatch portal for more details and nearby alternatives.

📱 MedWatch - Ensuring Medicine Access for Everyone`;

    return this.sendWhatsAppMessage(phoneNumber, message);
  }

  async sendPriceAlert(phoneNumber, priceDetails) {
    const message = `💰 PRICE ANOMALY ALERT 💰

Medicine: ${priceDetails.name}
Current Price: ₹${priceDetails.currentPrice}
Normal Price: ₹${priceDetails.normalPrice}
Increase: ${priceDetails.percentageIncrease}%

Location: ${priceDetails.location}

Check MedWatch for verified pharmacies with fair pricing.

📱 MedWatch - Protecting Patients from Price Manipulation`;

    return this.sendWhatsAppMessage(phoneNumber, message);
  }

  async sendInventoryAlert(phoneNumber, inventoryDetails) {
    const message = `📦 INVENTORY UPDATE ALERT 📦

Medicine: ${inventoryDetails.name}
Status: ${inventoryDetails.status}
Stock Level: ${inventoryDetails.stockLevel}
Pharmacy: ${inventoryDetails.pharmacyName}

${inventoryDetails.message}

Visit MedWatch dashboard to update your inventory.

📱 MedWatch - Real-time Medicine Tracking`;

    return this.sendWhatsAppMessage(phoneNumber, message);
  }
}

export default WhatsAppService;
