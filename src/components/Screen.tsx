import React, {Component} from 'react';
import {Dimensions, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {colors} from '../../theme';
import { PatientProfile } from '../core/patient/PatientState';
import PatientHeader from './PatientHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

export const screenWidth = Math.round(Dimensions.get('window').width) - 32;
export const screenHeight = Math.round(Dimensions.get('window').height);
export const isAndroid = (Platform.OS === 'android');
export const isIos = (Platform.OS === 'ios');


type HeaderProp = {
    children: any
};

export const Header = (props: HeaderProp) => {
    return (
      <View style={styles.headerBlock}>
          {props.children}
      </View>
    )
};


type OverviewProp = {
    children: any
};

export const Overview = (props: OverviewProp) => {
    return (
      <View style={styles.overviewBlock}>
          {props.children}
      </View>
    )
};


type ProgressBlockType = {
    children: any
};

export const ProgressBlock = (props: ProgressBlockType) => {
    return (
      <View style={styles.progressBlock}>
          {props.children}
      </View>
    )
};


type FieldWrapperType = {
    children: any,
    style?: any
};

export const FieldWrapper = (props: FieldWrapperType) => {
    return (
      <View style={[styles.fieldWrapper, props.style]}>
          {props.children}
      </View>
    )
};


/*
* A component to wrap all screens in a common wrapper.
* For permanent page fixtures
*/
type ScreenProps = {
    children: any;
    profile?: PatientProfile;
}

export default class Screen extends Component<ScreenProps> {
    screenWidth: number = screenWidth;
    screenHeight: number = screenHeight;

    render() {
        const profile = this.props.profile;
        const hasProfile = profile && profile.name;

        return (
            <SafeAreaView style={styles.screen}>
                {!!profile ? (
                    <PatientHeader profile={profile} />
                ): (
                    <View style={styles.statusBarBlock}></View>
                )}

                <ScrollView>
                    <View style={styles.pageBlock}>
                        {this.props.children}
                    </View>
                </ScrollView>

                {/* TODO: Put any fixed footer component */}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.white,
    },

    statusBarBlock: {
        marginVertical: 32,
    },

    pageBlock: {
        marginHorizontal: 16,
        marginBottom: 40,
    },

    headerBlock: {
        marginVertical: 16,
        marginHorizontal: 16,
    },

    overviewBlock: {
        marginVertical: 16,
        marginHorizontal: 16,
    },

    progressBlock: {
        marginHorizontal: 16,
    },

    fieldWrapper: {
        marginVertical: 16,
    }
});