import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import RHFQuillMultilocWithLocaleSwitcher from './';
import { useForm, FormProvider } from 'react-hook-form';
import { object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import validateMultiloc from 'utils/yup/validateMultiloc';

const schema = object({
  description: validateMultiloc('Error message'),
});

jest.mock('utils/cl-intl');
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);
jest.mock('hooks/useLocale');

const onSubmit = jest.fn();

const Form = ({ defaultValue }: { defaultValue?: Record<string, string> }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { description: defaultValue },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <RHFQuillMultilocWithLocaleSwitcher name="description" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('RHFQuillMultilocWithLocaleSwitcher', () => {
  it('renders', () => {
    const { container } = render(<Form />);
    expect(container.querySelector('.ql-editor')).toBeInTheDocument();
  });
  it('submits correct data from input', async () => {
    const defaultValue = { en: 'en description', 'nl-NL': 'nl description' };
    render(<Form defaultValue={defaultValue} />);

    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        description: defaultValue,
      })
    );
  });
  it('shows front-end validation error when there is one', async () => {
    render(<Form />);
    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });
});
