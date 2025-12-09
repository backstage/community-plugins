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

// PF colors, and moreover, use the defined color variables such that any changes made by PF are
// picked up when the PF version is updated.  The preferred, standard way, is in CSS styling.  In
// those cases we can directly let CSS resolve the PF var. So, whenever possible use the PFColors
// enum below.  In certain cases (like in cytoscape), we need the explicit hex value.  In that case
// we must actually get the computed value.  We do this as soon as we get an initial document (in
// StartupInitializer.tsx). In those cases use PFColorVals.  Note that those values are not
// available until they can be computed, so don't use them in constants or before they are
// available.

// Colors used by Kiali for CSS styling
export enum PFColors {
  Black100 = 'var(--pf-t--color--gray--10)',
  Black150 = 'var(--pf-t--color--gray--10)',
  Black200 = 'var(--pf-t--color--gray--20)',
  Black300 = 'var(--pf-t--color--gray--30)',
  Black400 = 'var(--pf-t--color--gray--40)',
  Black500 = 'var(--pf-t--color--gray--50)',
  Black600 = 'var(--pf-t--color--gray--60)',
  Black700 = 'var(--pf-t--color--gray--70)',
  Black800 = 'var(--pf-t--color--gray--80)',
  Black900 = 'var(--pf-t--color--gray--90)',
  Black1000 = 'var(--pf-t--color--gray--95)',
  Blue50 = 'var(--pf-t--color--blue--10)',
  Blue200 = 'var(--pf-t--color--blue--20)',
  Blue300 = 'var(--pf-t--color--blue--30)',
  Blue400 = 'var(--pf-t--color--blue--40)',
  Blue500 = 'var(--pf-t--color--blue--50)',
  Blue600 = 'var(--pf-t--color--teal--70)',
  Cyan300 = 'var(--pf-t--color--teal--40)',
  Gold400 = 'var(--pf-t--color--yellow--40)',
  Green300 = 'var(--pf-t--color--green--30)',
  Green400 = 'var(--pf-t--color--green--40)',
  Green500 = 'var(--pf-t--color--green--50)',
  Green600 = 'var(--pf-t--color--green--60)',
  LightBlue400 = 'var(--pf-t--chart--color--teal--200)',
  LightGreen400 = 'var(--pf-t--color--green--40)',
  LightGreen500 = 'var(--pf-t--color--green--50)',
  Orange50 = 'var(--pf-t--color--orange--10)',
  Orange400 = 'var(--pf-t--color--orange--40)',
  Purple100 = 'var(--pf-t--color--purple--10)',
  Purple200 = 'var(--pf-t--color--purple--20)',
  Purple500 = 'var(--pf-t--color--purple--40)',
  Red50 = 'var(--pf-t--color--red--10)',
  Red100 = 'var(--pf-t--color--red--10)',
  Red200 = 'var(--pf-t--color--red--20)',
  Red500 = 'var(--pf-t--color--red--50)',
  White = 'var(--pf-t--color--white)',

  // semantic kiali colors
  Active = 'var(--pf-t--color--blue--50)',
  ActiveText = 'var(--pf-t--color--blue--20)',
  Badge = 'var(--pf-t--color--blue--30)',
  Replay = 'var(--pf-t--global--color--brand--100)',
  Link = 'var(--pf-t--color--blue--50)',

  // Health/Alert colors https://www.patternfly.org/v4/design-guidelines/styles/colors
  Danger = 'var(--pf-t--global--icon--color--severity--critical--default)',
  Info = 'var(--pf-t--global--icon--color--severity--none--default)',
  InfoBackground = 'var(--pf-t--color--blue--70)',
  Success = 'var(--pf-t--chart--color--green--300)',
  SuccessBackground = 'var(--pf-t--color--green--70)',
  Warning = 'var(--pf-t--global--icon--color--severity--moderate--default)',

  // chart-specific color values, for rates charts where 4xx is really Danger not Warning
  ChartDanger = 'var(--pf-t--chart--color--red-orange--500)',
  ChartOther = 'var(--pf-t--color--gray--95)',
  ChartWarning = 'var(--pf-t--chart--color--red-orange--400)',

  // PF background colors (compatible with dark mode)
  BackgroundColor100 = 'var(--pf-t--global--background--color--primary--default)',
  BackgroundColor150 = 'var(--pf-t--global--background--color--tertiary--default)',
  BackgroundColor200 = 'var(--pf-t--global--background--color--secondary--default)',

  // PF standard colors (compatible with dark mode)
  Color100 = 'var(--pf-t--color--black)',
  Color200 = 'var(--pf-t--color--gray--50)',
  ColorLight100 = 'var(--pf-t--color--white)',
  ColorLight200 = 'var(--pf-t--color--gray--20)',
  ColorLight300 = 'var(--pf-t--color--gray--30)',

  // PF border colors (compatible with dark mode)
  BorderColor100 = 'var(--pf-t--global--border--color--100)',
  BorderColor200 = 'var(--pf-t--global--border--color--200)',
  BorderColor300 = 'var(--pf-t--global--border--color--300)',
  BorderColorLight100 = 'var(--pf-t--global--border--color--50)',
}

// The hex string value of the PF CSS variable
export type PFColorVal = string;

// Color values used by Kiali outside of CSS (i.e. when we must have the actual hex value)
export type PFColorValues = {
  Black100: PFColorVal;
  Black150: PFColorVal;
  Black200: PFColorVal;
  Black300: PFColorVal;
  Black400: PFColorVal;
  Black500: PFColorVal;
  Black600: PFColorVal;
  Black700: PFColorVal;
  Black1000: PFColorVal;
  Blue50: PFColorVal;
  Blue300: PFColorVal;
  Blue600: PFColorVal;
  Red50: PFColorVal;
  Orange50: PFColorVal;
  Gold400: PFColorVal;
  Green400: PFColorVal;
  Purple200: PFColorVal;
  White: PFColorVal;

  // Health/Alert colors https://www.patternfly.org/v4/design-guidelines/styles/colors
  Danger: PFColorVal;
  Success: PFColorVal;
  Warning: PFColorVal;

  // PF colors (compatible with dark mode)
  BackgroundColor100: PFColorVal;
  BackgroundColor200: PFColorVal;

  Color100: PFColorVal;
  Color200: PFColorVal;

  BorderColor100: PFColorVal;
  BorderColor200: PFColorVal;
  BorderColor300: PFColorVal;
};

export let PFColorVals: PFColorValues;

/*
  Extract color from var
  Input : var(--pf-t--color--gray--10)
  Output:  --pf-t--color--gray--10

  - In case there is not var then return the same input
*/
const getColor = (val: string) => {
  return val.indexOf('var(') === 0 ? val.split('(').pop()!.split(')')[0] : val;
};

export const setPFColorVals = (element: Element) => {
  PFColorVals = {
    // color values used by kiali
    Black100: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black100)),
    Black150: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black150)),
    Black200: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black200)),
    Black300: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black300)),
    Black400: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black400)),
    Black500: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black500)),
    Black600: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black600)),
    Black700: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black700)),
    Black1000: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Black1000)),
    Blue50: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Blue50)),
    Blue300: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Blue300)),
    Blue600: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Blue600)),
    Red50: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Red50)),
    Orange50: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Orange50)),
    Gold400: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Gold400)),
    Green400: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Green400)),
    Purple200: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Purple200)),
    White: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.White)),

    // status color values used by kiali
    Danger: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Danger)),
    Success: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Success)),
    Warning: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Warning)),

    // PF colors (compatible with dark mode)
    BackgroundColor100: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.BackgroundColor100)),
    BackgroundColor200: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.BackgroundColor200)),

    Color100: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Color100)),
    Color200: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.Color200)),

    BorderColor100: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.BorderColor100)),
    BorderColor200: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.BorderColor200)),
    BorderColor300: window
      .getComputedStyle(element)
      .getPropertyValue(getColor(PFColors.BorderColor300)),
  };
};
