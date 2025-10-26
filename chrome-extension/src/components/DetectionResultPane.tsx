import { Stack } from "@mantine/core";
import { flattenMenuItems, type MenuData } from "../types";
import DetectionResultCard from "./DetectionResultCard";

export default function DetectionResultPane(menu: MenuData) {
  const allitems = flattenMenuItems(menu);

  return (
    <Stack
      mah={"500px"}
      style={{ overflowY: "scroll" }}
      p={"sm"}
      bg={"orange.2"}
      bdrs={"sm"}
    >
      {allitems.map((item) => (
        <DetectionResultCard {...item} />
      ))}
    </Stack>
  );
}
