import {
  Card,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Space,
  Accordion,
} from "@mantine/core";
import {
  formatAllergenName,
  formatRating,
  type AllergenPrediction,
  type MenuItem,
} from "../../types/DetectionResult";
import { useMemo } from "react";

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
          <AccordionExplanation sortedPredictions={sortedPredictions} />
        </Stack>
      </Card>
    </>
  );
}

interface ExplanationProps {
  sortedPredictions: AllergenPrediction[];
}

function AccordionExplanation({ sortedPredictions }: ExplanationProps) {
  const firstElement = sortedPredictions[0].allergen;

  return (
    <>
      <Accordion chevronPosition="left" radius={0} defaultValue={firstElement}>
        {sortedPredictions.map((pred) => (
          <>
            <Accordion.Item key={pred.allergen} value={pred.allergen}>
              <Accordion.Control
                icon={
                  <Badge size="sm" radius={3} variant="transparent" c={"gray"}>
                    {formatRating(pred.prediction)}
                  </Badge>
                }
              >
                <Text tt={"capitalize"} size="xs" lineClamp={3}>
                  {formatAllergenName(pred.allergen)}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="xs" lineClamp={5}>
                  {pred.explanation}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          </>
        ))}
      </Accordion>
    </>
  );
}
