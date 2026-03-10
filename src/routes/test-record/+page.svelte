<script lang="ts">
  import Record from 'src/components/Record.svelte';
  // Mock repository
  const mockRepo = {
    update: async () => ({ hasError: false }),
    delete: async () => ({ hasError: false }),
  } as any;
</script>

<div style="padding: 2rem;">
  <Record
    klass="Uri"
    value="https://example.com"
    repository={mockRepo}
    editMode={true}
  />
  <Record
    klass="Twitter"
    value="@johndoe"
    repository={mockRepo}
    editMode={true}
  />
</div>