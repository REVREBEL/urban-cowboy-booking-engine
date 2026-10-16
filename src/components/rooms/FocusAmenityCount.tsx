import React from 'react';

export interface FocusAmenityCountProps {
  count: string,
  state: typeof FocusAmenityCountVariants.state[number],
  /** Used to override the default root style. */
  style?: StyleProp<ViewStyle>,
  /** Used to locate this view in end-to-end tests. */
  testID?: string,
}

export const FocusAmenityCountVariants = {
  state: ['Hover', 'Active', 'Default'],
} as const;

export function FocusAmenityCount(props: FocusAmenityCountProps) {
  const {state} = props;
  const {vstyles} = useVariants(FocusAmenityCountVariants, {state}, styles);

  return (
    <View testID={props.testID ?? "1199:3953"} style={[vstyles.root(), props.style]}>
      <View testID="1199:3955" style={vstyles.innerOutline()}/>
      <View testID="1199:3956" style={vstyles.inner()}/>
      <Text testID="1199:3979" style={vstyles.numberText()}>
        {props.count}
      </Text>
    </View>
  );
}

const FocusAmenityCount = () => (
<div>
  <div className="flex flex-col justify-center items-center gap-2.5 p-2.5 p-2 w-[675px] bg-secondary">
    <div className="number_text Blanco" '] self-stretch h-[655px] text-secondary-foreground text-center font-accent leading-[80%]">01</div>
    <div className="inner_outline right-[4rem] absolute w-[545px] h-[545px] top-[4.0625rem] bg-secondary-foreground" />
    <div className="inner right-[4.9375rem] absolute w-[515px] h-[515px] top-[5rem] bg-secondary]" />
  </div>
  <div className="flex flex-col items-start gap-2.5 p-2.5 p-2 w-[675px] h-[675px] bg-accent-background">
    <div className="Blanco" '] self-stretch text-accent text-center font-accent leading-[80%]">01</div>
    <div className="inner_outline-1 left-[4rem] absolute w-[546px] h-[545px] top-[4.0625rem] bg-accent" />
    <div className="inner-1 left-[5rem] absolute w-[515px] h-[515px] top-[5rem] bg-accent-background" />
  </div>
  <div className="flex flex-col items-start gap-2.5 p-2.5 p-2 w-[675px] bg-accent">
    <div className="Blanco" '] self-stretch h-[655px] text-accent-background text-center font-accent  leading-[80%]">01</div>
    <div className="inner_outline-2 right-[4rem] absolute w-[545px] h-[545px] top-[4.0625rem] bg-accent-background" />
    <div className="inner-2 left-[5rem] absolute w-[515px] h-[515px] top-[5rem] bg-accent" />
  </div>
</div>
);

export default FocusAmenityCount;