import Provider from "../models/Provider.js";

/* =========================================================
   CREATE PROVIDER
========================================================= */

export async function create(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const existing = await Provider.findOne({
      userId: req.user._id,
    }).populate("userId", "name email");

    if (existing) {
      return res.status(200).json({
        exists: true,
        message: "Provider profile already exists",
        provider: existing,
      });
    }

    const {
      name,
      skills,
      experience,
      hourlyRate,
      phone,
      city,
      about,
      availability,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Provider name is required",
      });
    }

    const provider = await Provider.create({
      userId: req.user._id,

      name: name.trim(),

      skills: Array.isArray(skills)
        ? skills
        : [],

      experience:
        Number(experience) || 0,

      hourlyRate:
        Number(hourlyRate) || 0,

      phone:
        phone?.trim() || "",

      city:
        city?.trim() || "",

      about:
        about?.trim() || "",

      availability:
        availability !== false,

      verified: false,
    });

    const populated = await Provider.findById(
      provider._id
    ).populate(
      "userId",
      "name email"
    );

    return res.status(201).json({
      exists: false,
      provider: populated,
    });

  } catch (error) {
    console.error(
      "Create provider error:",
      error
    );

    /* Duplicate userId protection */
    if (error.code === 11000) {
      const existing = await Provider.findOne({
        userId: req.user._id,
      }).populate(
        "userId",
        "name email"
      );

      return res.status(200).json({
        exists: true,
        message:
          "Provider profile already exists",
        provider: existing,
      });
    }

    return res.status(500).json({
      message:
        "Failed to create provider profile",
    });
  }
}

/* =========================================================
   GET ALL PROVIDERS
========================================================= */

export async function list(req, res) {
  try {
    const { skill, city } = req.query;

    const filter = {};

    if (skill) {
      filter.skills = skill;
    }

    if (city) {
      filter.city = city;
    }

    const providers =
      await Provider.find(filter)
        .populate(
          "userId",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.json(providers);

  } catch (error) {
    console.error(
      "Get providers error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load providers",
    });
  }
}

/* =========================================================
   GET CURRENT USER PROVIDER
========================================================= */

export async function mine(req, res) {
  try {
    const provider =
      await Provider.findOne({
        userId: req.user._id,
      }).populate(
        "userId",
        "name email"
      );

    if (!provider) {
      return res.status(404).json({
        message:
          "Provider profile not found",
      });
    }

    return res.json(provider);

  } catch (error) {
    console.error(
      "Get my provider error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load provider profile",
    });
  }
}

/* =========================================================
   UPDATE PROVIDER
========================================================= */

export async function update(req, res) {
  try {
    const provider =
      await Provider.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

    if (!provider) {
      return res.status(404).json({
        message:
          "Provider profile not found",
      });
    }

    const {
      name,
      skills,
      experience,
      hourlyRate,
      phone,
      city,
      about,
      availability,
    } = req.body;

    if (name !== undefined) {
      provider.name =
        String(name).trim();
    }

    if (skills !== undefined) {
      provider.skills =
        Array.isArray(skills)
          ? skills
          : provider.skills;
    }

    if (experience !== undefined) {
      provider.experience =
        Number(experience) || 0;
    }

    if (hourlyRate !== undefined) {
      provider.hourlyRate =
        Number(hourlyRate) || 0;
    }

    if (phone !== undefined) {
      provider.phone =
        String(phone).trim();
    }

    if (city !== undefined) {
      provider.city =
        String(city).trim();
    }

    if (about !== undefined) {
      provider.about =
        String(about).trim();
    }

    if (availability !== undefined) {
      provider.availability =
        Boolean(availability);
    }

    await provider.save();

    const updated =
      await Provider.findById(
        provider._id
      ).populate(
        "userId",
        "name email"
      );

    return res.json(updated);

  } catch (error) {
    console.error(
      "Update provider error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update provider",
    });
  }
}