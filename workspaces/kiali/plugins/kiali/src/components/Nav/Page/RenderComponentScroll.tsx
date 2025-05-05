/*
 * Copyright 2024 The Backstage Authors
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
import { default as React } from 'react';
import { classes } from 'typestyle';
import { kialiStyle } from '../../../styles/StyleUtils';

// TOP_PADDING constant is used to adjust the height of the main div to allow scrolling in the inner container layer.
const TOP_PADDING = 76 + 440;

/**
 * By default, Kiali hides the global scrollbar and fixes the height for some pages to force the scrollbar to appear
 * Hiding global scrollbar is not possible when Kiali is embedded in other application (like Openshift Console)
 * In these cases height is not fixed to avoid multiple scrollbars (https://github.com/kiali/kiali/issues/6601)
 * GLOBAL_SCROLLBAR environment variable is not defined in standalone Kiali application (value is always false)
 */
const globalScrollbar = process.env.GLOBAL_SCROLLBAR ?? 'false';

const componentStyle = kialiStyle({
  padding: '20px',
});

interface Props {
  className?: any;
  onResize?: (height: number) => void;
  children: React.ReactElement;
}

interface State {
  height: number;
}

export class RenderComponentScroll extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { height: 0 };
  }

  componentDidMount() {
    this.updateWindowDimensions();
    // @ts-ignore
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    // @ts-ignore
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    const topPadding = TOP_PADDING;

    this.setState(
      {
        // @ts-ignore
        height: window.innerHeight - topPadding,
      },
      () => {
        if (this.props.onResize) {
          this.props.onResize(this.state.height);
        }
      },
    );
  };

  render() {
    let scrollStyle = {};

    // If there is no global scrollbar, height is fixed to force the scrollbar to appear in the component
    if (globalScrollbar === 'false') {
      scrollStyle = { height: this.state.height, overflowY: 'auto' };
    }

    return (
      <div
        style={scrollStyle}
        className={classes(componentStyle, this.props.className)}
      >
        {this.props.children}
      </div>
    );
  }
}
