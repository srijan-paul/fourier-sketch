import { CanvasSpace } from 'pts';

const space = new CanvasSpace('#canvas');
space.setup({ bgcolor: '#fafafa' });

const form = space.getForm();
space.add(() => {
    space.bindMouse(true);
    form.point(space.pointer, 10);
});

space.play();
