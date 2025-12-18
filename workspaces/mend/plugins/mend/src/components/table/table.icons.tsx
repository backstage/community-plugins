import type { Ref } from 'react';
import { forwardRef } from 'react';
import AddBox from '@mui/icons-material/AddBox';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Check from '@mui/icons-material/Check';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Clear from '@mui/icons-material/Clear';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Edit from '@mui/icons-material/Edit';
import FilterList from '@mui/icons-material/FilterList';
import FirstPage from '@mui/icons-material/FirstPage';
import LastPage from '@mui/icons-material/LastPage';
import Remove from '@mui/icons-material/Remove';
import SaveAlt from '@mui/icons-material/SaveAlt';
import ViewColumn from '@mui/icons-material/ViewColumn';
import Retry from '@mui/icons-material/Replay';
import Resize from '@mui/icons-material/Height';

export const tableBackstageIcons = {
  Add: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <AddBox {...props} ref={ref} />
  )),
  Check: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <Check {...props} ref={ref} />
  )),
  Clear: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <Clear {...props} ref={ref} />
  )),
  Delete: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <DeleteOutline {...props} ref={ref} />
  )),
  DetailPanel: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <Edit {...props} ref={ref} />
  )),
  Export: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <SaveAlt {...props} ref={ref} />
  )),
  Filter: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <FilterList {...props} ref={ref} />
  )),
  FirstPage: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <FirstPage {...props} ref={ref} />
  )),
  LastPage: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <LastPage {...props} ref={ref} />
  )),
  NextPage: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <ChevronRight {...props} ref={ref} />
  )),
  PreviousPage: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <Clear {...props} ref={ref} />
  )),
  Resize: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <Resize {...props} ref={ref} />
  )),
  /**
   * Search icons added directly to the table
   */
  SortArrow: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <ArrowUpward {...props} ref={ref} />
  )),
  ThirdStateCheck: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <Remove {...props} ref={ref} />
  )),
  ViewColumn: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <ViewColumn {...props} ref={ref} />
  )),
  Retry: forwardRef((props, ref: Ref<SVGSVGElement>) => (
    <Retry {...props} ref={ref} />
  )),
};

export enum TableIcon {
  ERROR = 'error',
  EMPTY = 'empty',
}

export const tableIconMap = {
  [TableIcon.ERROR]: (
    <>
      <g clipPath="url(#clip0_387_4215)">
        <path
          d="M8 1.5C9.85652 1.5 11.637 2.2375 12.9497 3.55025C14.2625 4.86301 15 6.64348 15 8.5C15 10.3565 14.2625 12.137 12.9497 13.4497C11.637 14.7625 9.85652 15.5 8 15.5C6.14348 15.5 4.36301 14.7625 3.05025 13.4497C1.7375 12.137 1 10.3565 1 8.5C1 6.64348 1.7375 4.86301 3.05025 3.55025C4.36301 2.2375 6.14348 1.5 8 1.5ZM8 16.5C10.1217 16.5 12.1566 15.6571 13.6569 14.1569C15.1571 12.6566 16 10.6217 16 8.5C16 6.37827 15.1571 4.34344 13.6569 2.84315C12.1566 1.34285 10.1217 0.5 8 0.5C5.87827 0.5 3.84344 1.34285 2.34315 2.84315C0.842855 4.34344 0 6.37827 0 8.5C0 10.6217 0.842855 12.6566 2.34315 14.1569C3.84344 15.6571 5.87827 16.5 8 16.5ZM6.5 11.5C6.225 11.5 6 11.725 6 12C6 12.275 6.225 12.5 6.5 12.5H9.5C9.775 12.5 10 12.275 10 12C10 11.725 9.775 11.5 9.5 11.5H8.5V8C8.5 7.725 8.275 7.5 8 7.5H6.75C6.475 7.5 6.25 7.725 6.25 8C6.25 8.275 6.475 8.5 6.75 8.5H7.5V11.5H6.5ZM8 6.25C8.19891 6.25 8.38968 6.17098 8.53033 6.03033C8.67098 5.88968 8.75 5.69891 8.75 5.5C8.75 5.30109 8.67098 5.11032 8.53033 4.96967C8.38968 4.82902 8.19891 4.75 8 4.75C7.80109 4.75 7.61032 4.82902 7.46967 4.96967C7.32902 5.11032 7.25 5.30109 7.25 5.5C7.25 5.69891 7.32902 5.88968 7.46967 6.03033C7.61032 6.17098 7.80109 6.25 8 6.25Z"
          fill="#073C8C"
        />
      </g>
      <defs>
        <clipPath id="clip0_387_4215">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </>
  ),
  [TableIcon.EMPTY]: (
    <>
      <g clipPath="url(#clip0_387_4132)">
        <path
          d="M12 7C12 6.27773 11.8577 5.56253 11.5813 4.89524C11.3049 4.22795 10.8998 3.62163 10.3891 3.11091C9.87837 2.60019 9.27205 2.19506 8.60476 1.91866C7.93747 1.64226 7.22227 1.5 6.5 1.5C5.77773 1.5 5.06253 1.64226 4.39524 1.91866C3.72795 2.19506 3.12163 2.60019 2.61091 3.11091C2.10019 3.62163 1.69506 4.22795 1.41866 4.89524C1.14226 5.56253 1 6.27773 1 7C1 7.72227 1.14226 8.43747 1.41866 9.10476C1.69506 9.77205 2.10019 10.3784 2.61091 10.8891C3.12163 11.3998 3.72795 11.8049 4.39524 12.0813C5.06253 12.3577 5.77773 12.5 6.5 12.5C7.22227 12.5 7.93747 12.3577 8.60476 12.0813C9.27205 11.8049 9.87837 11.3998 10.3891 10.8891C10.8998 10.3784 11.3049 9.77205 11.5813 9.10476C11.8577 8.43747 12 7.72227 12 7ZM10.7281 11.9375C9.59375 12.9125 8.11563 13.5 6.5 13.5C2.90937 13.5 0 10.5906 0 7C0 3.40937 2.90937 0.5 6.5 0.5C10.0906 0.5 13 3.40937 13 7C13 8.61563 12.4125 10.0938 11.4375 11.2281L15.8531 15.6469C16.0469 15.8406 16.0469 16.1594 15.8531 16.3531C15.6594 16.5469 15.3406 16.5469 15.1469 16.3531L10.7281 11.9375Z"
          fill="#073C8C"
        />
      </g>
      <defs>
        <clipPath id="clip0_387_4132">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </>
  ),
};
