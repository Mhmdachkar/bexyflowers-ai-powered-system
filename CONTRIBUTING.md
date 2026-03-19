# Contributing to BexyFlowers

Thank you for your interest in contributing to BexyFlowers! We welcome contributions from the community.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Clear description** of the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (browser, OS, device)

### Suggesting Features

We love new ideas! For feature requests, please:

1. Check if the feature has already been requested
2. Create a detailed issue describing:
   - The problem it solves
   - How it would work
   - Any implementation ideas

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/bexyflowers-ai-powered-system.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test thoroughly**
   - Test on multiple browsers
   - Test on mobile and desktop
   - Ensure no console errors
   - Check that AI generation still works

5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots/videos if relevant

## 🎯 Development Guidelines

### Code Style

- **TypeScript** - Use proper types, avoid `any`
- **React** - Use functional components and hooks
- **Naming** - Use descriptive variable/function names
- **Comments** - Explain "why", not "what"
- **Formatting** - Use consistent indentation (2 spaces)

### Component Structure

```typescript
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Side effects here
  }, []);

  return (
    <motion.div>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </motion.div>
  );
};
```

### Performance

- Avoid unnecessary re-renders (`React.memo`, `useMemo`, `useCallback`)
- Lazy load images and components
- Optimize API calls (debounce, cache)
- Keep bundle size small

### Security

- **Never commit API keys** or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Follow OWASP best practices

### AI Integration (pollinations.ai)

When working with AI features:

- Always use the serverless proxy (never call pollinations.ai directly from browser)
- Keep prompts under 1000 characters
- Handle errors gracefully with user-friendly messages
- Show loading states during generation
- Cache results when appropriate

## 📋 Areas for Contribution

### High Priority

- [ ] Payment gateway integration
- [ ] Order tracking system
- [ ] Email notifications
- [ ] Admin analytics dashboard
- [ ] Mobile app (React Native)

### AI/ML Features

- [ ] Style transfer for existing bouquet images
- [ ] Color palette extraction and matching
- [ ] Seasonal bouquet recommendations
- [ ] Image-to-bouquet reverse search

### Performance

- [ ] Further bundle size optimization
- [ ] Image optimization pipeline
- [ ] Better caching strategies
- [ ] Offline mode improvements

### UX/UI

- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Dark mode
- [ ] Animations and micro-interactions
- [ ] Internationalization (i18n)

## 🧪 Testing

Before submitting a PR:

1. **Test locally**
   ```bash
   npm run dev
   ```

2. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

3. **Check for linting errors**
   ```bash
   npm run lint
   ```

4. **Test AI generation**
   - Go to `/customize`
   - Configure a bouquet
   - Click "Generate Preview"
   - Verify image appears

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [pollinations.ai API Docs](https://github.com/pollinations/pollinations/blob/main/APIDOCS.md)
- [Framer Motion](https://www.framer.com/motion/)

## 🌟 Recognition

Contributors will be:
- Added to the README contributors section
- Mentioned in release notes
- Credited in the app footer (for major contributions)

## 📞 Questions?

- **Email:** mohammadashkar11@gmail.com
- **GitHub Issues:** [Create an issue](../../issues)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making BexyFlowers better! 💐
