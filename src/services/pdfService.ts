import { Truck, Driver, TripWithRelations } from '../types';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

interface PDFTripData extends TripWithRelations {
  truck?: Truck;
  driver?: Driver;
}

class PDFService {
  private formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0.00';
    }
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  private formatDate(dateString: string | undefined | null): string {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private calculateDuration(startDate: string | undefined | null, endDate: string | undefined | null): number {
    if (!startDate || !endDate) {
      return 0;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async generateTripPDF(tripData: PDFTripData): Promise<string> {
    try {
      // For now, we'll create a simple text-based report
      // In a real implementation, you might want to use a web-based PDF generator
      const report = this.generateTextReport(tripData);
      
      // Return the report as a simple text format
      // In a production app, you'd want to use a proper PDF library
      return report;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  private generateTextReport(tripData: PDFTripData): string {
    const duration = this.calculateDuration(tripData.start_date, tripData.end_date);
    
    let report = `TRIP COST EXPORT DATA FORMAT\n\n`;
    report += `Trip: ${tripData.source || 'N/A'} → ${tripData.destination || 'N/A'}\n`;
    
    if (tripData.truck) {
      report += `Truck: ${tripData.truck.truck_number || 'N/A'} (${tripData.truck.model || 'N/A'})\n`;
    }
    
    report += `Start Date: ${this.formatDate(tripData.start_date)}\n`;
    report += `End Date: ${this.formatDate(tripData.end_date)}\n`;
    report += `Duration: ${duration} days\n`;
    
    if (tripData.driver) {
      report += `Driver: ${tripData.driver.name || 'N/A'}\n`;
    }
    
    report += `\n---\n\n🚛 DIESEL PURCHASES\n\n`;
    
    if (tripData.diesel_purchases && tripData.diesel_purchases.length > 0) {
      let totalDiesel = 0;
      tripData.diesel_purchases.forEach((purchase) => {
        const quantity = purchase.diesel_quantity || 0;
        const pricePerLiter = purchase.diesel_price_per_liter || 0;
        const cost = quantity * pricePerLiter;
        totalDiesel += cost;
        const location = purchase.city ? `${purchase.city}, ${purchase.state}` : purchase.state;
        report += `• ${location}: ${quantity} liters × ${this.formatCurrency(pricePerLiter)} = ${this.formatCurrency(cost)}\n`;
      });
      report += `\nTotal Diesel Cost: ${this.formatCurrency(totalDiesel)}\n`;
    } else {
      report += `No diesel purchases recorded\n`;
    }
    
    report += `\n---\n\n💰 OTHER EXPENSES\n\n`;
    
    // Fast Tag Cost
    if (tripData.fast_tag_cost && tripData.fast_tag_cost > 0) {
      report += `Fast Tag Cost: ${this.formatCurrency(tripData.fast_tag_cost)}\n\n`;
    }
    
    // DTO Cost
    if (tripData.dto_cost && tripData.dto_cost > 0) {
      report += `DTO Cost: ${this.formatCurrency(tripData.dto_cost)}\n\n`;
    }
    
    // RTO Cost
    if (tripData.rto_cost && tripData.rto_cost > 0) {
      report += `RTO Cost: ${this.formatCurrency(tripData.rto_cost)}\n\n`;
    }
    
    // MCD Cost
    if (tripData.mcd_cost && tripData.mcd_cost > 0) {
      report += `MCD Cost: ${this.formatCurrency(tripData.mcd_cost)}\n\n`;
    }
    
    // Green Tax Cost
    if (tripData.green_tax_cost && tripData.green_tax_cost > 0) {
      report += `Green Tax Cost: ${this.formatCurrency(tripData.green_tax_cost)}\n\n`;
    }
    
    // Border Cost
    if (tripData.border_cost && tripData.border_cost > 0) {
      report += `Border Cost: ${this.formatCurrency(tripData.border_cost)}\n\n`;
    }
    
    // Repair Cost
    if (tripData.repair_cost && tripData.repair_cost > 0) {
      report += `Repair Cost: ${this.formatCurrency(tripData.repair_cost)}\n\n`;
    }
    
    report += `---\n\n📊 TRIP SUMMARY\n\n`;
    
    // Calculate totals
    const totalDiesel = tripData.diesel_purchases?.reduce((sum, purchase) => {
      const quantity = purchase.diesel_quantity || 0;
      const pricePerLiter = purchase.diesel_price_per_liter || 0;
      return sum + (quantity * pricePerLiter);
    }, 0) || 0;
    const totalFastTag = tripData.fast_tag_cost || 0;
    const totalDTO = tripData.dto_cost || 0;
    const totalRTO = tripData.rto_cost || 0;
    const totalMCD = tripData.mcd_cost || 0;
    const totalGreenTax = tripData.green_tax_cost || 0;
    const totalBorder = tripData.border_cost || 0;
    const totalRepair = tripData.repair_cost || 0;
    const totalTripCost = totalDiesel + totalFastTag + totalDTO + totalRTO + totalMCD + totalGreenTax + totalBorder + totalRepair;
    
    report += `Diesel Purchases: ${this.formatCurrency(totalDiesel)}\n`;
    report += `Fast Tag: ${this.formatCurrency(totalFastTag)}\n`;
    report += `DTO: ${this.formatCurrency(totalDTO)}\n`;
    report += `RTO: ${this.formatCurrency(totalRTO)}\n`;
    report += `MCD: ${this.formatCurrency(totalMCD)}\n`;
    report += `Green Tax: ${this.formatCurrency(totalGreenTax)}\n`;
    report += `Border Costs: ${this.formatCurrency(totalBorder)}\n`;
    report += `Repairs: ${this.formatCurrency(totalRepair)}\n`;
    report += `TOTAL TRIP COST: ${this.formatCurrency(totalTripCost)}\n\n`;
    
    report += `---\n\n📱 Download Formats Available:\n`;
    report += `• PDF: Professional formatted report\n`;
    
    return report;
  }

  async sharePDF(reportText: string, tripData: PDFTripData): Promise<void> {
    try {
      // Show the report in an alert with copy option
      Alert.alert(
        `Trip Report: ${tripData.source} → ${tripData.destination}`,
        `Report generated successfully!\n\nLength: ${reportText.length} characters\n\nWould you like to copy it to clipboard?`,
        [
          {
            text: 'Copy to Clipboard',
            onPress: async () => {
              try {
                await Clipboard.setStringAsync(reportText);
                Alert.alert('Success', 'Trip report copied to clipboard!');
              } catch (error) {
                Alert.alert('Error', 'Failed to copy to clipboard');
              }
            }
          },
          {
            text: 'View Report',
            onPress: () => {
              // Show the full report in a longer alert
              Alert.alert(
                'Trip Report',
                reportText.length > 1000 ? 
                  `${reportText.substring(0, 1000)}...\n\n[Report truncated - use Copy to Clipboard for full report]` : 
                  reportText,
                [
                  {
                    text: 'Copy Full Report',
                    onPress: async () => {
                      try {
                        await Clipboard.setStringAsync(reportText);
                        Alert.alert('Success', 'Full trip report copied to clipboard!');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to copy to clipboard');
                      }
                    }
                  },
                  { text: 'Close', style: 'default' }
                ]
              );
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error showing report:', error);
      throw new Error('Failed to show report');
    }
  }
}

export default new PDFService();