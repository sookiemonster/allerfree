import { Box, Grid, Group, Select, Stack, Text, Title } from "@mantine/core";
import { flattenMenuItems, type DetectionResult } from "../../types";
import DetectionResultCard from "./DetectionResultCard";
import { useState, useMemo } from "react";
import { itemIsSafe } from "./DetectionParsingUtils";

interface DetectionResultPaneProps {
  detection_result: DetectionResult;
}

export default function DetectionResultPane({
  detection_result,
}: DetectionResultPaneProps) {
  const [profile, setProfile] = useState<string>(
    Object.keys(detection_result.results)[0]
  );

  const allitems = useMemo(() => {
    const items = flattenMenuItems(detection_result.results[profile]);
    items.sort((a, b) => Number(itemIsSafe(b)) - Number(itemIsSafe(a)));
    return items;
  }, [profile, detection_result.results]);

  return (
    <>
      <Box bdrs={"sm"}>
        <Grid px={"lg"} align="center" py={"xs"}>
          <Grid.Col ta={"left"} span={8}>
            <Title fs={"italic"} fw={"600"} c={"white"} order={4}>
              Here's What We Found
            </Title>
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              data={Object.keys(detection_result.results)}
              value={profile}
              allowDeselect={false}
              onChange={setProfile}
              comboboxProps={{
                position: "bottom",
                middlewares: { flip: false, shift: false },
                offset: 0,
              }}
            />
          </Grid.Col>
        </Grid>
        <Stack
          mah={"500px"}
          style={{ overflowY: "scroll" }}
          p={"sm"}
          bdrs={"sm"}
        >
          {allitems.map((item) => (
            <DetectionResultCard {...item} />
          ))}
        </Stack>
      </Box>
    </>
  );
}
