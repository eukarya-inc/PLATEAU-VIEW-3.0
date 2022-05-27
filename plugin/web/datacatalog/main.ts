import startMock from "../mock";

startMock().then(async () => {
  console.log(
    await fetch("https://example.com/user/aaa").then((r) => r.json())
  );
});

export {};
