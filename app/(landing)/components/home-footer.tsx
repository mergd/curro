import { Container, Item } from "@/components/motion";

export function HomeFooter() {
  return (
    <footer className="py-8 px-4 border-t bg-muted/20">
      <Container>
        <Item>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              Made by{" "}
              <a
                href="https://fldr.zip"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors"
              >
                fldr.zip
              </a>
            </p>
          </div>
        </Item>
      </Container>
    </footer>
  );
}
