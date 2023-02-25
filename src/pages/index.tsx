import { Center, Loader, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect } from "react";

function App() {
  const router = useRouter();

  useEffect(() => {
    const config = localStorage.getItem(`config`);

    if (config == null) {
      router.push("/setup");
      return;
    }

    router.push("/main");
  }, []);

  return (
    <Center w="full" h="100vh">
      <Stack align="center" justify="center">
        <Loader />
        <Text fw={600} fz="xl">
          TMZN
        </Text>
      </Stack>
    </Center>
  );
}

export default App;
