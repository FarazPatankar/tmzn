import {
  Alert,
  Center,
  Container,
  Flex,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { fetch } from "@tauri-apps/api/http";

import { Config, Member, ResponseData } from "../lib/types";
import WorldMap from "../components/WorldMap";

const getDay = (date: Date, timeZone: string) =>
  date.toLocaleString("en-US", { weekday: "short", timeZone });
const getTime = (date: Date, timeZone: string) =>
  date.toLocaleTimeString("en-US", {
    timeStyle: "short",
    timeZone,
  });

const Member: React.FC<{
  member: Member;
  onHighlightChange: (boolean) => void;
  highlighted: boolean;
}> = ({ member, onHighlightChange, highlighted }) => {
  const date = new Date();
  const timeZone = member.tz.rich_text[0].plain_text;
  const [dayTime, setDayTime] = useState({
    day: getDay(date, timeZone),
    time: getTime(date, timeZone),
  });

  const { name, img } = useMemo(() => {
    const name = member.Name.title[0].plain_text;
    const img = member.Image.files[0].file.url;

    return { name, img };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const day = getDay(date, timeZone);
      const time = getTime(date, timeZone);

      setDayTime({ day, time });
    }, 10000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <Group
      align="center"
      position="apart"
      px={6}
      style={{
        cursor: "pointer",
        background: highlighted ? "#c8d9eb" : "",
        borderRadius: 6,
      }}
      onMouseEnter={() => onHighlightChange(true)}
      onMouseLeave={() => onHighlightChange(false)}
    >
      <Group align="center" spacing="sm">
        <Image src={img} alt={name} radius="xl" width={40} height={40} />
        <Stack spacing={0}>
          <Text fz="xl" fw={600}>
            {dayTime.time}
          </Text>
          <Text fz="xs" transform="uppercase">
            {dayTime.day}
          </Text>
        </Stack>
      </Group>
      <Group>
        <Text fz="xs" fw={600} transform="uppercase" color="gray">
          {name}
        </Text>
      </Group>
    </Group>
  );
};

const Main: NextPage = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [highlightedMember, setHighlightedMember] = useState<Member | null>(
    null,
  );

  const router = useRouter();

  const getMembers = async () => {
    setError("");

    try {
      const config = localStorage.getItem("config") as unknown;
      if (config == null || typeof config !== "string") {
        setError("Invalid or missing config");
        return;
      }

      const { notionApiToken, notionDatabaseId } = JSON.parse(config) as Config;
      const response = await fetch(
        `https://api.notion.com/v1/databases/${notionDatabaseId}/query`,
        {
          headers: {
            Authorization: `Bearer ${notionApiToken}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(response.status as unknown as string);
      }

      const { results } = response.data as ResponseData;

      setMembers(results.map(result => result.properties));
    } catch (error) {
      setError(error.message ?? "Something went wrong");
    }

    setIsReady(true);
  };

  const onReset = () => {
    localStorage.removeItem("config");
    router.push("/setup");
  };

  useEffect(() => {
    getMembers();
  }, []);

  if (!isReady) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert title={error} color="red">
          Something went wrong while trying to fetch the members of your
          database. Please{" "}
          <UnstyledButton onClick={onReset}>
            <Text color="dark" size="sm" underline>
              click here to re-enter your credentials
            </Text>
          </UnstyledButton>
          .
        </Alert>
      </Center>
    );
  }

  return (
    <Container size="xl" mt={16}>
      {members.length === 0 ? (
        <Stack spacing="sm">
          <Alert title="No members found" color="red">
            Please add members to your database or{" "}
            <UnstyledButton onClick={onReset}>
              <Text color="dark" size="sm" underline>
                click here to re-enter your credentials
              </Text>
            </UnstyledButton>
            .
          </Alert>
        </Stack>
      ) : (
        <Flex direction="column" h="100%" gap={10}>
          <Flex style={{ overflow: "scroll" }} h="380px">
            <Stack spacing={2} w="100%">
              {members.map((member, i) => (
                <Member
                  key={member.Name.title[0].plain_text}
                  member={member}
                  highlighted={
                    highlightedMember?.Name.title[0].plain_text ===
                    member.Name.title[0].plain_text
                  }
                  onHighlightChange={h => {
                    setHighlightedMember(h ? member : null);
                  }}
                />
              ))}
            </Stack>
          </Flex>
          <Flex
            justify="center"
            style={{
              border: "1.5px dotted darkblue",
              borderRadius: 6,
              height: 150,
            }}
          >
            <WorldMap
              timeZoneName={highlightedMember?.tz.rich_text[0].plain_text}
            />
          </Flex>
          <Flex justify="center" m={2}>
            <Text
              fz="xs"
              color={highlightedMember ? "#005689" : "grey"}
              weight={highlightedMember ? "bold" : "normal"}
            >
              {highlightedMember?.tz.rich_text[0].plain_text ||
                "Highlight a member to see their timezone"}
            </Text>
          </Flex>
        </Flex>
      )}
    </Container>
  );
};

export default Main;
