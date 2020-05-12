import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik, FormikProps } from 'formik';
import { Form, Text } from 'native-base';
import React, { Component } from 'react';
import * as Yup from 'yup';

import ProgressStatus from '../../components/ProgressStatus';
import Screen, { Header, ProgressBlock } from '../../components/Screen';
import { BrandedButton, ErrorText, HeaderText } from '../../components/Text';
import { ValidationErrors } from '../../components/ValidationError';
import UserService, { isUSCountry } from '../../core/user/UserService';
import { PatientInfosRequest } from '../../core/user/dto/UserAPIContracts';
import i18n from '../../locale/i18n';
import { ScreenParamList } from '../ScreenParamList';
import { BloodPressureData, BloodPressureMedicationQuestion } from '../patient/fields/BloodPressureMedicationQuestion';
import {
  HormoneTreatmentData,
  HormoneTreatmentQuestion,
  TreatmentValue,
} from '../patient/fields/HormoneTreatmentQuestion';
import { PeriodData, PeriodQuestion, periodValues } from '../patient/fields/PeriodQuestion';
import { RaceEthnicityData, RaceEthnicityQuestion } from '../patient/fields/RaceEthnicityQuestion';

interface BackfillData extends BloodPressureData, RaceEthnicityData, PeriodData, HormoneTreatmentData {}

type BackDateProps = {
  navigation: StackNavigationProp<ScreenParamList, 'ProfileBackDate'>;
  route: RouteProp<ScreenParamList, 'ProfileBackDate'>;
};

type State = {
  errorMessage: string;
  needBloodPressureAnswer: boolean;
  needRaceAnswer: boolean;
  needPeriodStatusAnswer: boolean;
  needHormoneTreatmentAnswer: boolean;
};

const initialState: State = {
  errorMessage: '',
  needBloodPressureAnswer: false,
  needRaceAnswer: false,
  needPeriodStatusAnswer: false,
  needHormoneTreatmentAnswer: false,
};

export default class ProfileBackDateScreen extends Component<BackDateProps, State> {
  userService = new UserService();
  features = this.userService.getConfig();

  constructor(props: BackDateProps) {
    super(props);
    this.state = initialState;
  }

  registerSchema = Yup.object().shape({
    takesAnyBloodPressureMedications: Yup.string().when([], {
      is: () => this.state.needBloodPressureAnswer,
      then: Yup.string().required(),
    }),
    takesBloodPressureMedications: Yup.string().when([], {
      is: () => this.state.needBloodPressureAnswer,
      then: Yup.string().required(),
    }),
    takesBloodPressureMedicationsSartan: Yup.string().when([], {
      is: () => this.state.needBloodPressureAnswer,
      then: Yup.string().required(),
    }),

    race: Yup.array<string>().when([], {
      is: () => this.state.needRaceAnswer,
      then: Yup.array<string>().min(1, i18n.t('please-select-race')),
    }),
    raceOther: Yup.string().when('race', {
      is: (val: string[]) => this.state.needRaceAnswer && val.includes('other'),
      then: Yup.string().required(),
    }),
    ethnicity: Yup.string().when([], {
      is: () => this.state.needRaceAnswer && isUSCountry(),
      then: Yup.string().required(),
    }),

    havingPeriods: Yup.string().when([], {
      is: () => this.state.needPeriodStatusAnswer,
      then: Yup.string().required(i18n.t('your-health.please-select-periods')),
    }),
    periodFrequency: Yup.string().when('havingPeriods', {
      is: periodValues.CURRENTLY,
      then: Yup.string().required(i18n.t('your-health.please-select-period-frequency')),
    }),
    weeksPregnant: Yup.number().when('havingPeriods', {
      is: periodValues.PREGNANT,
      then: Yup.number()
        .typeError(i18n.t('your-health.correct-weeks-pregnant'))
        .min(0, i18n.t('your-health.correct-weeks-pregnant'))
        .max(50, i18n.t('your-health.correct-weeks-pregnant')),
    }),
    periodStoppedAge: Yup.number().when('havingPeriods', {
      is: periodValues.STOPPED,
      then: Yup.number()
        .typeError(i18n.t('your-health.correct-period-stopped-age'))
        .min(0, i18n.t('your-health.correct-period-stopped-age'))
        .max(100, i18n.t('your-health.correct-period-stopped-age')),
    }),
    hormoneTreatment: Yup.array<string>().when([], {
      is: () => this.state.needHormoneTreatmentAnswer,
      then: Yup.array<string>().min(1, i18n.t('your-health.please-select-hormone-treatments')),
    }),
  });

  async componentDidMount() {
    const userService = new UserService();
    const features = userService.getConfig();
    const currentPatient = this.props.route.params.currentPatient;
    this.setState({ needBloodPressureAnswer: !currentPatient.hasBloodPressureAnswer });
    this.setState({ needRaceAnswer: features.showRaceQuestion && !currentPatient.hasRaceAnswer });
    this.setState({ needPeriodStatusAnswer: !currentPatient.hasPeriodAnswer });
    this.setState({ needHormoneTreatmentAnswer: !currentPatient.hasHormoneTreatmentAnswer });
  }

  handleProfileUpdate(formData: BackfillData) {
    const { currentPatient } = this.props.route.params;
    const patientId = currentPatient.patientId;

    const userService = new UserService();
    const infos = this.createPatientInfos(formData);

    userService
      .updatePatient(patientId, infos)
      .then((response) => {
        if (formData.race) currentPatient.hasRaceAnswer = true;
        if (formData.takesAnyBloodPressureMedications) currentPatient.hasBloodPressureAnswer = true;
        if (formData.havingPeriods) currentPatient.hasPeriodAnswer = true;
        if (formData.hormoneTreatment?.length) currentPatient.hasHormoneTreatmentAnswer = true;
        this.props.navigation.replace('StartAssessment', { currentPatient });
      })
      .catch((err) => {
        this.setState({ errorMessage: i18n.t('something-went-wrong') });
      });
  }

  createPatientInfos(formData: BackfillData) {
    let infos: Partial<PatientInfosRequest> = {};

    if (this.state.needBloodPressureAnswer) {
      if (formData.takesAnyBloodPressureMedications) {
        infos = {
          ...infos,
          takes_any_blood_pressure_medications: formData.takesAnyBloodPressureMedications === 'yes',
        };
      }

      if (infos.takes_any_blood_pressure_medications) {
        infos = {
          ...infos,
          takes_blood_pressure_medications: formData.takesBloodPressureMedications === 'yes', // pril
          takes_blood_pressure_medications_sartan: formData.takesBloodPressureMedicationsSartan === 'yes',
        };
      }
    }

    if (this.state.needRaceAnswer) {
      if (formData.race) {
        infos = {
          ...infos,
          race: formData.race,
        };
      }

      if (formData.ethnicity) {
        infos = {
          ...infos,
          ethnicity: formData.ethnicity,
        };
      }

      if (formData.raceOther) {
        infos = {
          ...infos,
          race_other: formData.raceOther,
        };
      }
    }

    if (this.state.needPeriodStatusAnswer) {
      const periodDoc = PeriodQuestion.createPeriodDoc(formData);
      infos = {
        ...infos,
        ...periodDoc,
      };
    }

    if (this.state.needHormoneTreatmentAnswer) {
      const treatmentsDoc = HormoneTreatmentQuestion.createTreatmentsDoc(formData.hormoneTreatment as TreatmentValue[]);
      infos = {
        ...infos,
        ...treatmentsDoc,
      };
    }

    return infos;
  }

  render() {
    const currentPatient = this.props.route.params.currentPatient;

    return (
      <Screen profile={currentPatient.profile} navigation={this.props.navigation}>
        <Header>
          <HeaderText>{i18n.t('back-date-profile-title')}</HeaderText>
        </Header>

        <ProgressBlock>
          <ProgressStatus step={1} maxSteps={6} />
        </ProgressBlock>

        <Formik
          initialValues={{
            ...RaceEthnicityQuestion.initialFormValues(),
            ...BloodPressureMedicationQuestion.initialFormValues(),
            ...HormoneTreatmentQuestion.initialFormValues(),
            ...PeriodQuestion.initialFormValues(),
          }}
          validationSchema={this.registerSchema}
          onSubmit={(values: BackfillData) => {
            return this.handleProfileUpdate(values);
          }}>
          {(props) => {
            return (
              <Form>
                {this.state.needBloodPressureAnswer && (
                  <BloodPressureMedicationQuestion formikProps={props as FormikProps<BloodPressureData>} />
                )}

                {this.state.needRaceAnswer && (
                  <RaceEthnicityQuestion
                    showRaceQuestion={this.features.showRaceQuestion}
                    showEthnicityQuestion={this.features.showEthnicityQuestion}
                    formikProps={props as FormikProps<RaceEthnicityData>}
                  />
                )}

                {this.state.needPeriodStatusAnswer && <PeriodQuestion formikProps={props as FormikProps<PeriodData>} />}

                {this.state.needHormoneTreatmentAnswer && (
                  <HormoneTreatmentQuestion formikProps={props as FormikProps<HormoneTreatmentData>} />
                )}

                <ErrorText>{this.state.errorMessage}</ErrorText>
                {!!Object.keys(props.errors).length && <ValidationErrors errors={props.errors as string[]} />}

                <BrandedButton onPress={props.handleSubmit}>
                  <Text>{i18n.t('update-profile')}</Text>
                </BrandedButton>
              </Form>
            );
          }}
        </Formik>
      </Screen>
    );
  }
}