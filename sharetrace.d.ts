declare module '*.png';

declare module '*.svg' {
    import { SvgProps } from 'react-native-svg';
    const content: React.FC<SvgProps>;
    export default content;
}

declare namespace st {
    export type HealthSurvey = {
        symptoms: string[] | null;
        timestamp: number;
    };
}
