import { useState } from 'react';
import { EstablishEssentials } from './formComponents/EstablishEssentials';
import { GnosisMultisig } from './formComponents/GnosisMultisig';
import GuardDetails from './formComponents/GuardDetails';
import { UsulGovernance } from './formComponents/UsulGovernance';
import { UsulTokenDetails } from './formComponents/UsulTokenDetails';
import { ICreationStepProps, CreatorSteps } from './types';

function StepController(props: Omit<ICreationStepProps, 'step' | 'updateStep'>) {
  const [step, setStepState] = useState<CreatorSteps>(CreatorSteps.ESSENTIALS);
  const updateStep = (newStep: CreatorSteps) => {
    setStepState(newStep);
  };
  switch (step) {
    case CreatorSteps.ESSENTIALS:
      return (
        <EstablishEssentials
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.GNOSIS_GOVERNANCE:
      return (
        <GnosisMultisig
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    // case CreatorSteps.FUNDING: {
    //   return <SubsidiaryFunding />;
    // }
    case CreatorSteps.GNOSIS_WITH_USUL:
      return (
        <UsulTokenDetails
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.GOV_CONFIG:
      return (
        <UsulGovernance
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.GUARD_CONFIG:
      return (
        <GuardDetails
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    default:
      return <></>;
  }
}

export default StepController;
