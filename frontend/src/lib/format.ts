export const currency = (amount: number) => "$" + new Intl.NumberFormat("es-CL", {maximumFractionDigits: 0}).format(amount);
export const dateLabel = (date: string) => date ? new Date(`${date}T12:00:00`).toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"}) : "Por coordinar";
