/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { render, screen } from '@testing-library/react';
import { MdxContent } from './MdxContent';

describe('MdxContent', () => {
  it('renders the template with data as props', () => {
    render(
      <MdxContent
        template="Hello **{props.user.displayName}**"
        data={{ user: { displayName: 'Jane' } }}
      />,
    );
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('supports GitHub flavored markdown', () => {
    render(<MdxContent template={'| Name |\n| --- |\n| Jane |'} data={{}} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders custom components', () => {
    const Greeting = ({ name }: { name: string }) => <span>Hi {name}</span>;
    render(
      <MdxContent
        template='<Greeting name="Jane" />'
        data={{}}
        components={{ Greeting }}
      />,
    );
    expect(screen.getByText('Hi Jane')).toBeInTheDocument();
  });

  it('shows compilation errors', () => {
    render(<MdxContent template="<Unclosed" data={{}} />);
    expect(screen.getByText(/Unexpected end of file/)).toBeInTheDocument();
  });

  it('shows runtime errors', () => {
    render(<MdxContent template="{props.missing.value}" data={{}} />);
    expect(
      screen.getByText(/Failed to render the MDX template/),
    ).toBeInTheDocument();
  });
});
