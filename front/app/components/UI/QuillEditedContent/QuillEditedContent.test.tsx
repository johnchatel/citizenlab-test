import React from 'react';
import { render, screen, waitFor } from 'utils/testUtils/rtl';
import QuillEditedContent from '.';

describe('QuillEditedContent component', () => {
  it('Should change tabIndex on children properly', async () => {
    // multiple rerenders to simulate a user showing/hiding the contentnt multiple times

    const { rerender } = render(
      <QuillEditedContent disableTabbing={true}>
        <a href="www.google.com">link</a>
        <button>button</button>
        <iframe title="youtube embed">
          <div>iframe content</div>
        </iframe>
      </QuillEditedContent>
    );

    rerender(
      <QuillEditedContent disableTabbing={false}>
        <a href="www.google.com">link</a>
        <button>button</button>
        <iframe title="youtube embed">
          <div>iframe content</div>
        </iframe>
      </QuillEditedContent>
    );

    await waitFor(() => {
      expect(screen.getByRole('link')).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      expect(screen.getByTitle('youtube embed')).toHaveAttribute(
        'tabindex',
        '0'
      );
    });

    rerender(
      <QuillEditedContent disableTabbing={true}>
        <a href="www.google.com">link</a>
        <button>button</button>
        <iframe title="youtube embed">
          <div>iframe content</div>
        </iframe>
      </QuillEditedContent>
    );

    await waitFor(() => {
      expect(screen.getByRole('link')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByTitle('youtube embed')).toHaveAttribute(
        'tabindex',
        '-1'
      );
    });

    rerender(
      <QuillEditedContent disableTabbing={false}>
        <a href="www.google.com">link</a>
        <button>button</button>
        <iframe title="youtube embed">
          <div>iframe content</div>
        </iframe>
      </QuillEditedContent>
    );

    await waitFor(() => {
      expect(screen.getByRole('link')).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
      expect(screen.getByTitle('youtube embed')).toHaveAttribute(
        'tabindex',
        '0'
      );
    });
  });
});
