const WelcomeScreen: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        flexDirection: "column",
        background: "blue",
        height: "500px",
        width: "500px",
      }}>
      <h1 style={{ background: "orange", margin: "0 auto" }}>WELCOME TO PLATEAU</h1>
    </div>
  );
};

export default WelcomeScreen;
