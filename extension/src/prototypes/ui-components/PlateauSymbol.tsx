import { createSvgIcon, styled } from "@mui/material";

const Root = createSvgIcon(
  <>
    <path
      d="M11.7514 9.63769L9.91274 8.57611L3.65234 4.96173V14.3138L20.3469 23.9523V14.6003L17.008 12.6726L16.0492 12.119L13.669 10.7448L11.7514 9.63769Z"
      fill="#463c64"
    />
    <path d="M11.7514 0L3.90039 4.53285L9.78862 7.93242L11.7514 9.06558V0Z" fill="#00bebe" />
    <path
      d="M16.0495 11.5468V6.87078L20.099 4.53285L12.248 0V9.35208L13.7686 10.23L16.0495 11.5468Z"
      fill="#00bebe"
    />
    <path
      d="M20.3473 14.0273V4.96173L16.5459 7.15639V11.8325L17.3062 12.2714L20.3473 14.0273Z"
      fill="#463c64"
    />
  </>,
  "Symbol",
);

export const PlateauSymbol = styled(Root)(({ theme }) => ({
  ...(theme.palette.mode === "dark" && {
    "& path": {
      fill: theme.palette.text.primary,
    },
  }),
}));
