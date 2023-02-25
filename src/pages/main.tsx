import {
  Alert,
  Center,
  Container,
  Group,
  Image,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { NextPage } from "next";
import { useState, useEffect, useMemo } from "react";

import { Config, Member } from "../lib/types";

const getDay = (date: Date, timeZone: string) =>
  date.toLocaleString("en-US", { weekday: "short", timeZone });
const getTime = (date: Date, timeZone: string) =>
  date.toLocaleTimeString("en-US", {
    timeStyle: "short",
    timeZone,
  });

const Member: React.FC<{ member: Member }> = ({ member }) => {
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
    <Group align="center" position="apart">
      <Group align="center" spacing="sm">
        <Image src={img} alt={name} radius="xl" width={48} height={48} />
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
        `/api/members?token=${notionApiToken}&id=${notionDatabaseId}`,
      );

      if (!response.ok) {
        setError(response.statusText);
        return;
      }

      const data = await response.json();

      setMembers(data.results.map(result => result.properties));
      setIsReady(true);
    } catch (error) {
      console.log(error);
    }

    setIsReady(true);
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
        <Alert title="Error">Something went wrong...</Alert>
      </Center>
    );
  }

  return (
    <Container size={400} my="xl">
      <Stack spacing="sm">
        {members.map(member => (
          <Member key={member.Name.title[0].plain_text} member={member} />
        ))}
      </Stack>
    </Container>
  );
};

export default Main;
