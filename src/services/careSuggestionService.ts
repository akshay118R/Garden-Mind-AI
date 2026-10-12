import { Plant, CareTask, CareSuggestion } from '../types/garden';
import { getLocalTodayDate, addDays } from '../utils/dateUtils';

/**
 * Botanical Rule-Based Care Suggestion Engine
 *
 * Generates transparent, actionable care suggestions derived strictly
 * from user-supplied plant metadata, watering guidance, and placement.
 * Suggestions are never automatically added to the calendar without user confirmation.
 */
export function generateCareSuggestions(
  plants: Plant[],
  existingTasks: CareTask[],
  todayStr: string = getLocalTodayDate()
): CareSuggestion[] {
  const suggestions: CareSuggestion[] = [];

  for (const plant of plants) {
    const plantPendingTasks = existingTasks.filter(
      (t) => t.plantId === plant.id && !t.completed
    );

    // Rule 1: Attention Status -> Targeted Health & Pest Inspection
    if (plant.careStatus === 'attention') {
      const hasHealthTask = plantPendingTasks.some(
        (t) => t.taskType === 'pest_inspection' || t.taskType === 'general'
      );
      if (!hasHealthTask) {
        suggestions.push({
          id: `sugg-health-${plant.id}`,
          plantId: plant.id,
          plantName: plant.name,
          taskType: 'pest_inspection',
          title: `Inspect leaf margins and stems for ${plant.name}`,
          reason: `Specimen is marked as "Needs attention". Examine leaf undersides and node joints for signs of stress or pests.`,
          suggestedDueDate: todayStr,
          priority: 'high',
        });
      }
    }

    // Rule 2: Routine Hydration Assessment (Soil moisture check)
    if (plant.wateringFrequencyDays && plant.wateringFrequencyDays > 0) {
      const hasWateringTask = plantPendingTasks.some((t) => t.taskType === 'watering');
      if (!hasWateringTask) {
        const daysAgoText = plant.lastWatered ? ` (last recorded: ${plant.lastWatered})` : '';
        suggestions.push({
          id: `sugg-water-${plant.id}`,
          plantId: plant.id,
          plantName: plant.name,
          taskType: 'watering',
          title: `Soil moisture & hydration check for ${plant.name}`,
          reason: `Based on your target ${plant.wateringFrequencyDays}-day schedule${daysAgoText}. Test the top 3–5 cm of potting medium before watering.`,
          suggestedDueDate: plant.nextWateringDays === 0 ? todayStr : addDays(todayStr, 1),
          priority: plant.nextWateringDays === 0 ? 'high' : 'medium',
        });
      }
    }

    // Rule 3: Indoor Window / Shelf Specimen -> Sunlight Rotation
    if (plant.location && /window|shelf|corner|desk/i.test(plant.location)) {
      const hasSunTask = plantPendingTasks.some((t) => t.taskType === 'sunlight');
      if (!hasSunTask) {
        suggestions.push({
          id: `sugg-sun-${plant.id}`,
          plantId: plant.id,
          plantName: plant.name,
          taskType: 'sunlight',
          title: `Quarter-turn rotation for ${plant.name}`,
          reason: `Located near "${plant.location}". Periodic rotation prevents phototropic leaning and encourages symmetrical growth.`,
          suggestedDueDate: addDays(todayStr, 2),
          priority: 'low',
        });
      }
    }

    // Rule 4: Broad Foliage Dusting & Photosynthesis Check
    if (
      plant.category === 'Foliage' ||
      /monstera|fiddle|fig|calathea|philodendron/i.test(plant.species || '')
    ) {
      const hasMaintenanceTask = plantPendingTasks.some(
        (t) => t.taskType === 'misting' || t.taskType === 'general'
      );
      if (!hasMaintenanceTask) {
        suggestions.push({
          id: `sugg-dust-${plant.id}`,
          plantId: plant.id,
          plantName: plant.name,
          taskType: 'general',
          title: `Wipe broad foliage and check humidity for ${plant.name}`,
          reason: `Large indoor leaves accumulate ambient dust which reduces light absorption. Gently wipe with a soft, damp cloth.`,
          suggestedDueDate: addDays(todayStr, 3),
          priority: 'low',
        });
      }
    }
  }

  // Cap at 4 most relevant suggestions to avoid overwhelming the user
  return suggestions.slice(0, 4);
}
