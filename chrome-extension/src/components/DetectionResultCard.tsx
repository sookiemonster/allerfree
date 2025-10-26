import {
  Card,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Divider,
  Space,
  Collapse,
  Button,
} from "@mantine/core";
import {
  formatAllergenName,
  formatRating,
  type AllergenPrediction,
  type MenuItem,
} from "../types/DetectionResult";
import { useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";

function SafetyBadge({ is_safe }: { is_safe: boolean }) {
  return (
    <Badge variant="" autoContrast color={is_safe ? "lime" : "red"}>
      {is_safe ? "Safe" : "Avoid"}
    </Badge>
  );
}

function SymbolBadge({ symbol }: { symbol: string }) {
  return (
    <Badge color="brown" radius="xs" size="xs" w={"xl"} variant="light">
      {symbol}
    </Badge>
  );
}

function AllergenExplanation({
  allergen,
  explanation,
  prediction,
  safe_to_eat,
}: AllergenPrediction) {
  console.log(safe_to_eat);

  return (
    <>
      <Stack gap={2}>
        <Group gap={"xs"} justify="space-between">
          <Text tt={"capitalize"} size="sm" fw={"bold"}>
            {formatAllergenName(allergen)}
          </Text>
          <Text size="xs">
            {
              <Badge size="sm" radius={3} variant="transparent" c={"gray"}>
                {formatRating(prediction)}
              </Badge>
            }
          </Text>
        </Group>
        <Divider />
        <Text size="xs" lineClamp={3}>
          {explanation}
        </Text>
      </Stack>
    </>
  );
}

export default function DetectionResultCard({
  name,
  description,
  symbols,
  contains,
}: MenuItem) {
  const sortedPredictions = useMemo(() => {
    const copy = contains.slice();
    return copy.sort((a, b) => Number(a.safe_to_eat) - Number(b.safe_to_eat));
  }, [contains]);

  const unsafe_predictions = contains.filter((pred) => !pred.safe_to_eat);
  const is_safe_overall = unsafe_predictions.length === 0;

  return (
    <>
      <Card p={"lg"} mah={"400px"} flex={"none"}>
        <Stack ta="left" gap={0}>
          <Group justify="space-between">
            <Title tt={"capitalize"} size={"lg"}>
              {name.toLowerCase()}
            </Title>
            <SafetyBadge is_safe={is_safe_overall} />
          </Group>
          {symbols.length > 0 && (
            <Group gap="xs">
              <Text size="xs">Found Menu Tags: </Text>
              {symbols.map((symbol) => (
                <SymbolBadge symbol={symbol} />
              ))}
            </Group>
          )}
          <Space h={"xs"} />
          <Text size="sm" lineClamp={2}>
            {description || (
              <Text fs={"italic"} c={"gray"}>
                No description found.
              </Text>
            )}
          </Text>
          <Space h={"xs"} />
          {CollapsibleExplanation(sortedPredictions)}
        </Stack>
      </Card>
    </>
  );
}

function CollapsibleExplanation(sortedPredictions: AllergenPrediction[]) {
  const [opened, { toggle }] = useDisclosure(false);

  const firstPrediction = useMemo(() => {
    const first_pred = sortedPredictions[0];
    return <AllergenExplanation {...first_pred} />;
  }, [sortedPredictions]);

  const restOfPredictions = useMemo(() => {
    return sortedPredictions.slice(1);
  }, [sortedPredictions]);

  return (
    <>
      {firstPrediction}
      <Space h={"md"} />
      {restOfPredictions.length > 0 && (
        <>
          <Collapse in={opened}>
            <Stack gap={"md"} pb={"sm"}>
              {restOfPredictions.map((pred) => (
                <AllergenExplanation {...pred} />
              ))}
            </Stack>
          </Collapse>
          <Button variant="light" color="gray" onClick={toggle} size="xs">
            {opened ? "Close" : "See More"}
          </Button>
        </>
      )}
    </>
  );
}
