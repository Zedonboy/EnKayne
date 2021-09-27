<template>
  <div class="flex text-gray-400 p-2 space-x-2 shadow rounded-b-xl bg-white">
    <button
      title="Free Hand"
      @click="setCurrentTool('free_hand')"
      class="rounded-full p-1 hover:text-blue-500"
      :class="{ 'bg-blue-100 text-blue-500': 'free_hand' === tool }"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-8"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
        />
      </svg>
    </button>
    <button
      @click="setCurrentTool('text')"
      class="rounded-full p-1 w-10 h-10 hover:text-blue-500"
      :class="{ 'bg-blue-100 text-blue-500': 'text' === tool }"
    >
      <p class="font-bold text-2xl">T</p>
    </button>
    <button
      @click="setCurrentTool('eraser')"
      class="rounded-full p-1 hover:text-blue-500"
      :class="{ 'bg-blue-100 text-blue-500': 'eraser' === tool }"
    >
      <svg
        id="Capa_1"
        enable-background="new 0 0 512.121 512.121"
        class="h-6 w-8 fill-current"
        strokeColor="currentColor"
        viewBox="0 0 512.121 512.121"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="m317.025 33.131-317.025 317.025 128.835 128.834h132.521l250.765-250.764zm152.67 195.095-84.233 84.233-152.669-152.669 84.232-84.232zm-105.446 105.446-21.247 21.247-152.67-152.669 21.248-21.248zm-115.318 115.318h-107.67l-98.835-98.834 126.693-126.693 152.67 152.669z"
          />
        </g>
      </svg>
    </button>
    <button
      @click="setCurrentTool('rect_shape')"
      class="rounded-full p-2 w-10 h-10 hover:text-blue-500"
      :class="{ 'bg-blue-100': 'shape' === tool }"
      title="Shape"
    >
      <div
        class="border-2 h-6 w-6"
        :class="{ 'border-blue-500': 'shape' === tool }"
      ></div>
    </button>
    <button
      @click="setCurrentTool('circle_shape')"
      class="rounded-full p-2 w-10 h-10 hover:text-blue-500"
      :class="{ 'bg-blue-100': 'shape' === tool }"
      title="Shape"
    >
      <div
        class="border-2 h-6 w-6 rounded-full"
        :class="{ 'border-blue-500': 'shape' === tool }"
      ></div>
    </button>
    <button
      @click="toggleMic"
      title="Mic"
      class="rounded-full p-1 hover:text-green-500"
      :class="{ 'bg-green-100 text-green-500': mic }"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-8"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <button @click="toggleSpeaker" class="rounded-full p-1 hover:text-green-500"
    :class="{ 'bg-green-100 text-green-500': speaker }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
      </svg>
    </button>
    <button @click="undo" class="rounded-full p-1 hover:text-blue-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    </button>

    <button @click="redo" class="rounded-full p-1 hover:text-blue-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </button>
  </div>
</template>
<script>
export default {
  emits: ["toolSelected", "undo", "redo", "micToggled", "speakerToggled"],
  data() {
    return {
      tool: "none",
      mic: false,
      speaker:false
    };
  },

  methods: {
    setCurrentTool(data) {
      this.tool = data;
      this.$emit("toolSelected", data);
    },



    undo() {
      this.$emit("undo");
    },

    redo() {
      this.$emit("redo");
    },

    toggleMic() {
      if (this.mic) {
        this.mic = false;
      } else {
        this.mic = true;
      }
      this.$emit("micToggled", this.mic);
    },

    toggleSpeaker() {
      if (this.speaker) {
        this.speaker = false;
      } else {
        this.speaker = true;
      }
      this.$emit("speakerToggled", this.speaker);
    }
  },
};
</script>