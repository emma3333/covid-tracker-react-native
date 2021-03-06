import { RegularBoldText, RegularText } from "./Text";
import React from "react";
import { StyleSheet } from "react-native";
import { colors } from "../../theme";
import I18n from "i18n-js";

type ContributionCounterProps = {variant: number, count: number | null}
export const ContributionCounter = (props: ContributionCounterProps) => {
    if (props.count) {
        const countValue = I18n.toNumber(props.count, {precision: 0});
        return props.variant === 1 ?
                <RegularText style={styles.contributingText}>
                    Join <RegularBoldText style={styles.contributingTextValue}>{countValue}</RegularBoldText> people contributing
                </RegularText>
            : props.variant === 2 ?
                <RegularText style={styles.contributingText}>
                    <RegularBoldText style={styles.contributingText}>{countValue}</RegularBoldText> people contributing
                </RegularText> : null
    }
    return null;
};


const styles = StyleSheet.create({
    contributingText: {
        fontSize: 24,
        lineHeight: 32,
        color: colors.lightBrand,
        textAlign: "center",
    },
    contributingTextValue: {
        fontSize: 24,
        lineHeight: 32,
        color: colors.white,
        textAlign: "center",
    }
});
