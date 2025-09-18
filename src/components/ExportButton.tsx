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
            paddingHorizontal: SIZES.spacingSm,
            paddingVertical: SIZES.spacingXs,
            fontSize: SIZES.fontSizeXs,
            iconSize: 14,
        },
        medium: {
            paddingHorizontal: SIZES.spacingMd,
            paddingVertical: SIZES.spacingSm,
            fontSize: SIZES.fontSizeSm,
            iconSize: 18,
        },
        large: {
            paddingHorizontal: SIZES.spacingLg,
            paddingVertical: SIZES.spacingMd,
            fontSize: SIZES.fontSizeMd,
            iconSize: 20,
        },
    };

    const variantConfig = {
        primary: {
            backgroundColor: COLORS.primary,
            textColor: COLORS.textInverse,
            borderColor: COLORS.primary,
            shadow: false,
        },
        secondary: {
            backgroundColor: COLORS.secondary,
            textColor: COLORS.textInverse,
            borderColor: COLORS.secondary,
            shadow: false,
        },
        outline: {
            backgroundColor: COLORS.surface,
            textColor: COLORS.primary,
            borderColor: COLORS.primary,
            shadow: true,
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
                    paddingHorizontal: config.paddingHorizontal,
                    paddingVertical: config.paddingVertical,
                    backgroundColor: variantStyle.backgroundColor,
                    borderColor: variantStyle.borderColor,
                    borderWidth: variant === 'outline' ? 1 : 0,
                },
                variantStyle.shadow && SIZES.shadow,
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
        minHeight: 32,
    },
    icon: {
        marginRight: SIZES.spacingXs,
    },
    text: {
        fontWeight: '600' as const,
        fontSize: SIZES.fontSizeXs,
        letterSpacing: 0.5,
    },
});

export default ExportButton;
