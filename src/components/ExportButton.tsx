import React, { useState } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import pdfService from '../services/pdfService';
import { TripWithRelations } from '../types';

interface ExportButtonProps {
    trip: TripWithRelations;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'outline';
    onExportComplete?: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
    trip,
    size = 'medium',
    variant = 'primary',
    onExportComplete,
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const sizeConfig = {
        small: {
            padding: SIZES.spacingSm,
            fontSize: SIZES.fontSizeXs,
            iconSize: 16,
        },
        medium: {
            padding: SIZES.spacingMd,
            fontSize: SIZES.fontSizeSm,
            iconSize: 20,
        },
        large: {
            padding: SIZES.spacingLg,
            fontSize: SIZES.fontSizeMd,
            iconSize: 24,
        },
    };

    const variantConfig = {
        primary: {
            backgroundColor: COLORS.primary,
            textColor: COLORS.textInverse,
            borderColor: COLORS.primary,
        },
        secondary: {
            backgroundColor: COLORS.secondary,
            textColor: COLORS.textInverse,
            borderColor: COLORS.secondary,
        },
        outline: {
            backgroundColor: 'transparent',
            textColor: COLORS.primary,
            borderColor: COLORS.primary,
        },
    };

    const config = sizeConfig[size];
    const variantStyle = variantConfig[variant];

    const handleExport = async () => {
        try {
            setIsExporting(true);

            // Generate report
            const reportText = await pdfService.generateTripPDF(trip);

            // Share report
            await pdfService.sharePDF(reportText, trip);

            Alert.alert(
                'Export Successful',
                'Trip report has been generated and is ready to share!',
                [{ text: 'OK', onPress: onExportComplete }]
            );
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert(
                'Export Failed',
                'Failed to generate trip report. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    padding: config.padding,
                    backgroundColor: variantStyle.backgroundColor,
                    borderColor: variantStyle.borderColor,
                    borderWidth: variant === 'outline' ? 1 : 0,
                },
            ]}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.7}
        >
            {isExporting ? (
                <ActivityIndicator
                    size="small"
                    color={variantStyle.textColor}
                />
            ) : (
                <>
                    <Ionicons
                        name="download-outline"
                        size={config.iconSize}
                        color={variantStyle.textColor}
                        style={styles.icon}
                    />
                    <Text
                        style={[
                            styles.text,
                            {
                                fontSize: config.fontSize,
                                color: variantStyle.textColor,
                            },
                        ]}
                    >
                        Export PDF
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.radius,
        ...SIZES.shadow,
    },
    icon: {
        marginRight: SIZES.spacingXs,
    },
    text: {
        fontWeight: '600' as const,
    },
});

export default ExportButton;
