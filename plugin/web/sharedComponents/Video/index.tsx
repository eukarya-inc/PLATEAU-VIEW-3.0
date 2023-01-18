type Props = {
  width?: string;
  height?: string;
  src?: string;
};
const Video: React.FC<Props> = ({ width, height, src }) => {
  return (
    <iframe
      width={width}
      height={height}
      src={src}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen></iframe>
  );
};
export default Video;
