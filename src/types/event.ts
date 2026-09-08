export type EventCategory =
  | "WORKSHOP"
  | "SPEAKER"
  | "MEAL"
  | "SOCIAL"
  | "MINIEVENT"
  | "QNA"
  | "CHECKIN"
  | "OTHER";

export interface EventLocation {
  description: string;
  tags?: string[];
  latitude: number;
  longitude: number;
}

export interface ApiEvent {
  eventId: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  locations: EventLocation[];
  sponsor?: string;
  eventType: EventCategory;
  points?: number;
  isAsync?: boolean;
  mapImageUrl?: string;
}

export interface ScheduleEvent extends Omit<ApiEvent, "startTime" | "endTime" | "locations"> {
  startTime: Date;
  endTime: Date;
  locationLabel: string;
}

