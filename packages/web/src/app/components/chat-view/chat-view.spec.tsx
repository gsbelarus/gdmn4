import { render } from '@testing-library/react';

import ChatView from './chat-view';

describe('ChatView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ChatView />);
    expect(baseElement).toBeTruthy();
  });
});
