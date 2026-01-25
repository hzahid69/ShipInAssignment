export async function getTextContent(element: { textContent(): Promise<string | null> }): Promise<string> {
    return (await element.textContent()) || '';
}