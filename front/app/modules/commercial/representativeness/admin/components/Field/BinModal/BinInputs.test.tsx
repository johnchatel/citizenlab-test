import React from 'react';
import BinInputs from './BinInputs';
import { fireEvent, render, screen } from 'utils/testUtils/rtl';

jest.mock('services/appConfiguration')
jest.mock('utils/cl-intl')

const bins = [18, 25, 35, 55, null];

describe('<BinInputs />', () => {
  describe('initial render', () => {
    it('renders age groups correctly', () => {
      render(
        <BinInputs
          bins={bins}
          onUpdateLowerBound={jest.fn()}
          onUpdateUpperBound={jest.fn()}
        />
      )

      expect(screen.getByText('Age group 1')).toBeInTheDocument();
      expect(screen.getByText('Age group 2')).toBeInTheDocument();
      expect(screen.getByText('Age group 3')).toBeInTheDocument();
      expect(screen.getByText('Age group 4')).toBeInTheDocument();
      expect(screen.queryByText('Age group 5')).not.toBeInTheDocument();
    })

    it('renders inputs correctly', () => {
      const { container } = render(
        <BinInputs
          bins={bins}
          onUpdateLowerBound={jest.fn()}
          onUpdateUpperBound={jest.fn()}
        />
      )

      const inputs = container.querySelectorAll('input');

      expect(inputs).toHaveLength(8);
      expect(inputs[0]).toHaveValue(18)
      expect(inputs[1]).toHaveValue(24)
      expect(inputs[2]).toHaveValue(25)
      expect(inputs[3]).toHaveValue(34)
      expect(inputs[4]).toHaveValue(35)
      expect(inputs[5]).toHaveValue(54)
      expect(inputs[6]).toHaveValue(55)
      expect(inputs[7]).toHaveValue(null)
    })

    it('renders ranges correctly when filled out except upper bound', () => {
      render(
        <BinInputs
          bins={bins}
          onUpdateLowerBound={jest.fn()}
          onUpdateUpperBound={jest.fn()}
        />
      )

      expect(screen.getByText('18-24')).toBeInTheDocument();
      expect(screen.getByText('25-34')).toBeInTheDocument();
      expect(screen.getByText('35-54')).toBeInTheDocument();
      expect(screen.getByText('55 and over')).toBeInTheDocument();
    })

    it('renders ranges correctly when filled out including upper bound', () => {
      render(
        <BinInputs
          bins={[18, 25, 35, 55, 80]}
          onUpdateLowerBound={jest.fn()}
          onUpdateUpperBound={jest.fn()}
        />
      )

      expect(screen.getByText('18-24')).toBeInTheDocument();
      expect(screen.getByText('25-34')).toBeInTheDocument();
      expect(screen.getByText('35-54')).toBeInTheDocument();
      expect(screen.getByText('55-80')).toBeInTheDocument();
    })
  })

  describe('changing bins', () => {
    it.only('updates correctly if a bin value is changed to allowed value', async () => {
      const onUpdateLowerBound = jest.fn();

      const { container, rerender } = render(
        <BinInputs
          bins={bins}
          onUpdateLowerBound={onUpdateLowerBound}
          onUpdateUpperBound={jest.fn()}
        />
      )

      const inputs = container.querySelectorAll('input');

      // On input: change range of bin itself, but not yet linked cell
      fireEvent.input(inputs[2], { target: { value: 21 } });

      rerender(
        <BinInputs
          bins={bins}
          onUpdateLowerBound={jest.fn()}
          onUpdateUpperBound={jest.fn()}
        />
      )

      expect(screen.queryByText('25-34')).not.toBeInTheDocument();
      expect(screen.getByText('21-34')).toBeInTheDocument();
      expect(screen.getByText('18-24')).toBeInTheDocument();
      expect(screen.queryByText('18-21')).not.toBeInTheDocument();

      // On blur: calls update function with correct values
      fireEvent.blur(inputs[2]);

      expect(onUpdateLowerBound).toHaveBeenCalledTimes(1);
      expect(onUpdateLowerBound).toHaveBeenCalledWith(1, 21);
    })
  })

  describe('removing bin', () => {
    // TODO
  })
})