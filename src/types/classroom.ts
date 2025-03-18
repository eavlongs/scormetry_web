export type Classroom = {
    id: string;
    name: string;
    color: ColorType;
};

export const colorMap = {
    red: "bg-red-700",
    blue: "bg-paragon",
    purple: "bg-purple-900",
    green: "bg-green-900",
    gray: "bg-gray-900",
    brown: "bg-amber-900",
};

export const classroomColors = Object.keys(colorMap) as ColorType[];

export type ColorType = keyof typeof colorMap;
