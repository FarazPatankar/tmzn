import { NextPage } from "next";
import {
  Alert,
  Button,
  Container,
  Flex,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/router";
import { Config } from "../lib/types";

const Setup: NextPage = () => {
  const [token, setToken] = useState("");
  const [databaseId, setDatabaseId] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const onSubmit = e => {
    e.preventDefault();
    setError("");

    try {
      const config: Config = {
        notionApiToken: token,
        notionDatabaseId: databaseId,
      };
      localStorage.setItem("config", JSON.stringify(config));

      router.push("/");
    } catch (error) {
      setError("Failed to save config!");
    }
  };

  return (
    <Container size={400}>
      <Flex direction="column" gap="lg">
        <Title>tmzn</Title>
        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="md">
            <Flex direction="column" gap="sm">
              <TextInput
                label="Notion API Token"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
              />
              <TextInput
                label="Notion Database ID"
                value={databaseId}
                onChange={e => setDatabaseId(e.target.value)}
                required
              />
            </Flex>
            {error && (
              <Alert title="Error" color="red">
                {error}
              </Alert>
            )}
            <Button type="submit">Submit</Button>
          </Flex>
        </form>
      </Flex>
    </Container>
  );
};

export default Setup;
