import React from 'react';
import {
  Input as InputComponent,
  InputProps,
} from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError } from 'typings';
import { get } from 'lodash-es';

interface Props extends InputProps {
  name: string;
}

const Input = ({ name, type = 'text', ...rest }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const defaultValue = '';
  const errors = get(formContextErrors, name);
  const validationError = errors?.message as string | undefined;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError =
    (errors?.error as string | undefined) && ([errors] as unknown as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => (
          <InputComponent id={name} type={type} {...field} {...rest} />
        )}
      />
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={false}
        />
      )}
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default Input;
