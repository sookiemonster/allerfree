import { Box, Grid, ScrollArea, Select, Stack, Title } from "@mantine/core";
import { flattenMenuItems, type DetectionResult } from "../../types";
import DetectionResultCard from "./DetectionResultCard";
import { useState, useEffect } from "react";
import { itemIsSafe } from "./DetectionParsingUtils";
import classes from "./Detection.module.css";

interface DetectionResultPaneProps {
  detection_result: DetectionResult;
}

export default function DetectionResultPane({
  detection_result,
}: DetectionResultPaneProps) {
  const [profile, setProfile] = useState<string | null>(null);
  const [allProfiles, setAllProfiles] = useState<string[]>([]);

  useEffect(() => {
    if (!detection_result?.results) {
      console.error(typeof detection_result);
      console.error(JSON.stringify(detection_result, null, 2));
      console.error("Failed to fetch detection results.");
      return;
    }

    console.log("Identifying first profile.");
    const detected_profiles = Object.keys(detection_result.results);
    const updated_profile = detected_profiles[0];
    setProfile(updated_profile);
    setAllProfiles(detected_profiles);
  }, [detection_result]);

  if (!profile) {
    <Select
      data={allProfiles}
      value={profile}
      onChange={setProfile}
      comboboxProps={{
        position: "bottom",
        middlewares: { flip: false, shift: false },
        offset: 0,
        zIndex: 999,
      }}
    />;

    return <>No profile was selected.</>;
  }

  const allitems = flattenMenuItems(detection_result?.results[profile]) || [];
  allitems.sort((a, b) => Number(itemIsSafe(b)) - Number(itemIsSafe(a)));

  if (!detection_result?.results) {
    return (
      <>
        An error occurred. {profile} {detection_result}
      </>
    );
  }

  console.log("Profiels", allProfiles);

  return (
    <>
      <Box /*bdrs={"sm"}*/>
        <Grid px={"lg"} align="center" py={"xs"}>
          <Grid.Col ta={"left"} span={8}>
            <Title fs={"italic"} fw={"600"} c={"black"} order={4}>
              Here's What We Found
            </Title>
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              data={allProfiles}
              value={profile}
              allowDeselect={false}
              onChange={setProfile}
              comboboxProps={{
                position: "bottom",
                middlewares: { flip: false, shift: false },
                offset: 0,
                zIndex: 999,
              }}
            />
          </Grid.Col>
        </Grid>

        <ScrollArea mah={"350px"} scrollbars="y" pr={"xs"} classNames={classes}>
          <Stack p={"sm"} mah={"350px"}>
            {allitems.map((item) => (
              <DetectionResultCard {...item} />
            ))}
          </Stack>
        </ScrollArea>
      </Box>
    </>
  );
}
